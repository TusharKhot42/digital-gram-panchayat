import { ROLES } from '@dgp/shared';
import { parsePagination } from '../../utils/pagination.js';
import { Poll, PollVote } from './poll.model.js';
import { AppError } from '../../utils/app-error.js';
import { writeAudit } from '../audit/audit.service.js';

/** MongoDB's duplicate-key error. The unique index is what actually enforces one vote each. */
const DUPLICATE_KEY = 11000;

function isOpen(poll, now = new Date()) {
  return !poll.closesAt || new Date(poll.closesAt) > now;
}

/**
 * What a citizen is allowed to see.
 *
 * Tallies are withheld until they have voted or the poll has closed. Showing a running result
 * to someone who has not yet voted is a well-known way to bias the answer, and on a village
 * poll about where to spend money that bias is the whole point of asking.
 */
function shapeForCitizen(poll, votedOptionId, now = new Date()) {
  const row = poll.toJSON ? poll.toJSON() : { ...poll, id: String(poll._id), _id: undefined };
  const open = isOpen(row, now);
  const hasVoted = Boolean(votedOptionId);
  const reveal = hasVoted || !open;

  return {
    id: row.id,
    question: row.question,
    description: row.description,
    closesAt: row.closesAt,
    isOpen: open,
    hasVoted,
    votedOptionId: votedOptionId ? String(votedOptionId) : null,
    totalVotes: reveal ? row.totalVotes : undefined,
    options: (row.options ?? []).map((o) => ({
      id: String(o._id ?? o.id),
      text: o.text,
      votes: reveal ? o.votes : undefined,
      percent:
        reveal && row.totalVotes
          ? Math.round((o.votes / row.totalVotes) * 100)
          : reveal
            ? 0
            : undefined,
    })),
  };
}

/** Open, published polls plus this citizen's own vote on each. */
export async function publicList(citizenId, query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { isActive: true, isPublished: true };
  const now = new Date();

  const [rows, total] = await Promise.all([
    Poll.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Poll.countDocuments(filter),
  ]);

  // One query for every vote this citizen has cast on the polls on this page, rather than one
  // query per poll.
  const votes = citizenId
    ? await PollVote.find({ citizenId, pollId: { $in: rows.map((r) => r._id) } }).lean()
    : [];
  const byPoll = new Map(votes.map((v) => [String(v.pollId), v.optionId]));

  return {
    data: rows.map((r) => shapeForCitizen(r, byPoll.get(String(r._id)), now)),
    page,
    limit,
    total,
  };
}

export async function castVote(citizenId, pollId, optionId) {
  const poll = await Poll.findOne({ _id: pollId, isActive: true, isPublished: true }).catch(
    () => null,
  );
  if (!poll) throw new AppError(404, 'POLL_NOT_FOUND', 'Poll not found');
  if (!isOpen(poll)) throw new AppError(400, 'POLL_CLOSED', 'This poll has closed');

  const option = poll.options.id(optionId);
  if (!option) throw new AppError(400, 'INVALID_OPTION', 'That option is not on this poll');

  try {
    await PollVote.create({ pollId: poll._id, citizenId, optionId: option._id });
  } catch (err) {
    // The unique index rejected a second vote. Racing requests both land here; both get 409.
    if (err?.code === DUPLICATE_KEY) {
      throw new AppError(409, 'ALREADY_VOTED', 'You have already voted in this poll');
    }
    throw err;
  }

  // Only after the vote row is safely written do the tallies move, so a rejected duplicate
  // can never inflate the count.
  const updated = await Poll.findOneAndUpdate(
    { _id: poll._id, 'options._id': option._id },
    { $inc: { 'options.$.votes': 1, totalVotes: 1 } },
    { new: true },
  );

  return shapeForCitizen(updated, option._id);
}

/** Officer view — full tallies always, including unpublished drafts. */
export async function adminList(query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { isActive: true };
  const [rows, total] = await Promise.all([
    Poll.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Poll.countDocuments(filter),
  ]);
  return {
    data: rows.map((r) => ({
      ...r,
      id: String(r._id),
      _id: undefined,
      isOpen: isOpen(r),
      options: (r.options ?? []).map((o) => ({
        id: String(o._id),
        text: o.text,
        votes: o.votes,
        percent: r.totalVotes ? Math.round((o.votes / r.totalVotes) * 100) : 0,
      })),
    })),
    page,
    limit,
    total,
  };
}

function parseOptions(value) {
  const raw = typeof value === 'string' ? JSON.parse(value) : value;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((o) => (typeof o === 'string' ? o : o?.text))
    .filter((text) => String(text ?? '').trim())
    .map((text) => ({ text: String(text).trim(), votes: 0 }));
}

export async function createPoll(officerId, body) {
  const options = parseOptions(body.options);
  if (options.length < 2) {
    throw new AppError(400, 'POLL_OPTIONS', 'A poll needs at least two options');
  }
  const poll = await Poll.create({
    question: body.question,
    description: body.description || '',
    options,
    closesAt: body.closesAt || undefined,
    isPublished: body.isPublished === true || body.isPublished === 'true',
    createdBy: officerId,
  });
  await writeAudit({
    actorId: officerId,
    actorRole: ROLES.OFFICER,
    action: 'poll.create',
    entity: 'polls',
    entityId: poll.id,
    after: { question: poll.question },
  });
  return poll.toJSON();
}

/**
 * Only publication and closing time can be changed once a poll exists. Editing the question or
 * the options after people have voted would silently reassign their answers to something they
 * never chose.
 */
export async function updatePoll(id, officerId, body) {
  const poll = await Poll.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!poll) throw new AppError(404, 'POLL_NOT_FOUND', 'Poll not found');

  if (body.isPublished !== undefined) {
    poll.isPublished = body.isPublished === true || body.isPublished === 'true';
  }
  if (body.closesAt !== undefined) poll.closesAt = body.closesAt || undefined;

  await poll.save();
  await writeAudit({
    actorId: officerId,
    actorRole: ROLES.OFFICER,
    action: 'poll.update',
    entity: 'polls',
    entityId: poll.id,
    after: { isPublished: poll.isPublished },
  });
  return poll.toJSON();
}

export async function deletePoll(id, officerId) {
  const poll = await Poll.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!poll) throw new AppError(404, 'POLL_NOT_FOUND', 'Poll not found');
  poll.isActive = false;
  await poll.save();
  await writeAudit({
    actorId: officerId,
    actorRole: ROLES.OFFICER,
    action: 'poll.delete',
    entity: 'polls',
    entityId: poll.id,
  });
  return { id: poll.id };
}
