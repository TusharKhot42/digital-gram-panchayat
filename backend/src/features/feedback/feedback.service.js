import { FEEDBACK_CATEGORIES } from '@dgp/shared';
import { parsePagination } from '../../utils/pagination.js';
import { Feedback } from './feedback.model.js';
import { AppError } from '../../utils/app-error.js';

/**
 * Strip the identity from an anonymous entry.
 *
 * This runs on every read path. The citizen id stays in the database (see the model note) but
 * must never leave the API on an entry the citizen asked to keep anonymous — including in the
 * officer portal, because "anonymous" that an officer can see through is not anonymous.
 */
function shape(row, { includeCitizen = false } = {}) {
  const base = row.toJSON ? row.toJSON() : { ...row, id: String(row._id), _id: undefined };
  const anonymous = base.isAnonymous;
  return {
    id: base.id,
    category: base.category,
    rating: base.rating,
    comment: base.comment,
    isAnonymous: anonymous,
    createdAt: base.createdAt,
    citizenName: anonymous || !includeCitizen ? undefined : base.citizenId?.fullName,
  };
}

export async function submitFeedback(citizenId, body) {
  if (!FEEDBACK_CATEGORIES.includes(body.category)) {
    throw new AppError(400, 'INVALID_CATEGORY', 'Unknown feedback category');
  }
  const entry = await Feedback.create({
    citizenId,
    category: body.category,
    rating: Number(body.rating),
    comment: body.comment || '',
    isAnonymous: body.isAnonymous === true || body.isAnonymous === 'true',
  });
  return shape(entry);
}

/** A citizen's own submissions, newest first. */
export async function myFeedback(citizenId, query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { citizenId, isActive: true };
  const [rows, total] = await Promise.all([
    Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Feedback.countDocuments(filter),
  ]);
  return { data: rows.map((r) => shape(r)), page, limit, total };
}

/**
 * The public score per service: average and count, and nothing else. No comments and no
 * identities on this endpoint — it feeds the citizen-facing summary.
 */
export async function publicSummary() {
  const rows = await Feedback.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$category', average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const byCategory = new Map(rows.map((r) => [r._id, r]));

  return FEEDBACK_CATEGORIES.map((category) => {
    const row = byCategory.get(category);
    return {
      category,
      // One decimal is as much precision as a 1-5 rating can honestly carry.
      average: row ? Math.round(row.average * 10) / 10 : null,
      count: row ? row.count : 0,
    };
  });
}

/** Officer analytics: per-category averages plus a monthly trend. */
export async function analytics(months = 6) {
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const [byCategory, trend, overall] = await Promise.all([
    publicSummary(),
    Feedback.aggregate([
      { $match: { isActive: true, createdAt: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          average: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Feedback.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
  ]);

  return {
    byCategory,
    trend: trend.map((t) => ({
      month: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
      average: Math.round(t.average * 10) / 10,
      count: t.count,
    })),
    overall: overall[0]
      ? { average: Math.round(overall[0].average * 10) / 10, count: overall[0].count }
      : { average: null, count: 0 },
  };
}

/** Officer list of individual entries, with anonymity respected. */
export async function adminList(query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { isActive: true };
  if (query.category) filter.category = query.category;

  const [rows, total] = await Promise.all([
    Feedback.find(filter)
      .populate('citizenId', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Feedback.countDocuments(filter),
  ]);
  return { data: rows.map((r) => shape(r, { includeCitizen: true })), page, limit, total };
}
