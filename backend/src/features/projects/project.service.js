import { ROLES } from '@dgp/shared';
import { parsePagination } from '../../utils/pagination.js';
import { Project } from './project.model.js';
import { getNextSequence } from '../complaints/counter.model.js';
import { AppError } from '../../utils/app-error.js';
import { uploadAttachment } from '../../utils/upload.js';
import { writeAudit } from '../audit/audit.service.js';

function buildProjectNumber(year, seq) {
  return `PRJ-${year}-${String(seq).padStart(4, '0')}`;
}

/** Utilisation as a percentage, clamped — see the note on `amountSpent` in the model. */
function utilisation(row) {
  if (!row.budget) return 0;
  return Math.min(100, Math.round((row.amountSpent / row.budget) * 100));
}

function shape(doc) {
  const row = doc.toJSON ? doc.toJSON() : { ...doc, id: String(doc._id), _id: undefined };
  return { ...row, utilisation: utilisation(row) };
}

async function audit(officerId, action, project) {
  await writeAudit({
    actorId: officerId,
    actorRole: ROLES.OFFICER,
    action,
    entity: 'projects',
    entityId: project.id ?? String(project._id),
    after: { name: project.name },
  });
}

function buildFilter(query, publishedOnly) {
  const filter = { isActive: true };
  if (publishedOnly) filter.isPublished = true;
  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  return filter;
}

export async function publicList(query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildFilter(query, true);
  const [rows, total] = await Promise.all([
    Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Project.countDocuments(filter),
  ]);
  return { data: rows.map(shape), page, limit, total };
}

/**
 * Village-wide totals for the citizen page. Computed in the database rather than by pulling
 * every project into memory, so the figure stays correct once there are hundreds of works and
 * the page is still only asking for one screen of them.
 */
export async function publicSummary() {
  const [agg] = await Project.aggregate([
    { $match: { isActive: true, isPublished: true } },
    {
      $group: {
        _id: null,
        totalBudget: { $sum: '$budget' },
        totalSpent: { $sum: '$amountSpent' },
        count: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'InProgress'] }, 1, 0] } },
      },
    },
  ]);
  const base = agg ?? {
    totalBudget: 0,
    totalSpent: 0,
    count: 0,
    completed: 0,
    inProgress: 0,
  };
  return {
    totalBudget: base.totalBudget,
    totalSpent: base.totalSpent,
    count: base.count,
    completed: base.completed,
    inProgress: base.inProgress,
    utilisation: base.totalBudget
      ? Math.min(100, Math.round((base.totalSpent / base.totalBudget) * 100))
      : 0,
  };
}

export async function publicDetail(id) {
  const row = await Project.findOne({ _id: id, isActive: true, isPublished: true })
    .lean()
    .catch(() => null);
  if (!row) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');
  return shape(row);
}

export async function adminList(query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildFilter(query, false);
  const [rows, total] = await Promise.all([
    Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Project.countDocuments(filter),
  ]);
  return { data: rows.map(shape), page, limit, total };
}

export async function adminDetail(id) {
  const row = await Project.findOne({ _id: id, isActive: true })
    .lean()
    .catch(() => null);
  if (!row) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');
  return shape(row);
}

const NUMERIC = ['budget', 'amountSpent', 'progress'];
const TEXT = [
  'name',
  'description',
  'category',
  'fundingSource',
  'contractor',
  'engineer',
  'location',
  'status',
  'startDate',
  'endDate',
];

/**
 * Spending can never exceed the sanctioned budget, and progress is a percentage. Both are
 * clamped here rather than trusted: these numbers are published to citizens, and "112% of
 * budget utilised" reads as either corruption or incompetence when it is really a typo.
 */
function clampMoney(project) {
  project.progress = Math.min(100, Math.max(0, Number(project.progress) || 0));
  project.budget = Math.max(0, Number(project.budget) || 0);
  project.amountSpent = Math.min(project.budget, Math.max(0, Number(project.amountSpent) || 0));
}

async function uploadPhotos(files = []) {
  const uploaded = [];
  for (const file of files) {
    const { url } = await uploadAttachment(file, 'projects');
    uploaded.push({ url, caption: '' });
  }
  return uploaded;
}

export async function createProject(officerId, body, files = []) {
  const year = new Date().getFullYear();
  const seq = await getNextSequence(`project-${year}`);

  const project = new Project({
    projectNumber: buildProjectNumber(year, seq),
    createdBy: officerId,
    isPublished: body.isPublished === true || body.isPublished === 'true',
  });
  for (const key of TEXT) if (body[key] !== undefined) project[key] = body[key] || undefined;
  for (const key of NUMERIC) if (body[key] !== undefined) project[key] = Number(body[key]) || 0;
  clampMoney(project);
  project.photos = await uploadPhotos(files);

  await project.save();
  await audit(officerId, 'project.create', project);
  return shape(project);
}

export async function updateProject(id, officerId, body, files = []) {
  const project = await Project.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!project) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');

  for (const key of TEXT) if (body[key] !== undefined) project[key] = body[key] || undefined;
  for (const key of NUMERIC) if (body[key] !== undefined) project[key] = Number(body[key]) || 0;
  if (body.isPublished !== undefined) {
    project.isPublished = body.isPublished === true || body.isPublished === 'true';
  }
  clampMoney(project);

  if (files.length) project.photos.push(...(await uploadPhotos(files)));

  // A progress update is worth keeping as a dated milestone, so citizens see movement.
  if (body.milestone) {
    project.milestones.push({ label: String(body.milestone), progress: project.progress });
  }

  await project.save();
  await audit(officerId, 'project.update', project);
  return shape(project);
}

export async function deleteProject(id, officerId) {
  const project = await Project.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!project) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found');
  project.isActive = false;
  await project.save();
  await audit(officerId, 'project.delete', project);
  return { id: project.id };
}
