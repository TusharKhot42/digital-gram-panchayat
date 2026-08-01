import { ROLES } from '@dgp/shared';
import { parsePagination } from '../../utils/pagination.js';
import { DownloadDoc } from './download.model.js';
import { AppError } from '../../utils/app-error.js';
import { uploadAttachment, deleteAsset } from '../../utils/upload.js';
import { writeAudit } from '../audit/audit.service.js';

function shape(doc) {
  return doc.toJSON ? doc.toJSON() : { ...doc, id: String(doc._id), _id: undefined };
}

function buildFilter(query, publishedOnly) {
  const filter = { isActive: true };
  if (publishedOnly) filter.isPublished = true;
  if (query.category) filter.category = query.category;
  if (query.year) filter.year = String(query.year);
  return filter;
}

export async function publicList(query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildFilter(query, true);
  const [rows, total] = await Promise.all([
    DownloadDoc.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    DownloadDoc.countDocuments(filter),
  ]);
  return { data: rows.map(shape), page, limit, total };
}

/**
 * Record that a copy was taken and hand back the file URL.
 *
 * A separate endpoint rather than counting on the list, so the number means "someone opened
 * this document", not "someone scrolled past it".
 */
export async function registerDownload(id) {
  const doc = await DownloadDoc.findOneAndUpdate(
    { _id: id, isActive: true, isPublished: true },
    { $inc: { downloadCount: 1 } },
    { new: true },
  ).catch(() => null);
  if (!doc) throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Document not found');
  return { id: doc.id, fileUrl: doc.fileUrl, fileName: doc.fileName, count: doc.downloadCount };
}

export async function adminList(query = {}) {
  const { page, limit, skip } = parsePagination(query);
  const filter = buildFilter(query, false);
  const [rows, total] = await Promise.all([
    DownloadDoc.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    DownloadDoc.countDocuments(filter),
  ]);
  return { data: rows.map(shape), page, limit, total };
}

export async function createDocument(officerId, body, file) {
  if (!file) throw new AppError(400, 'FILE_REQUIRED', 'Attach the document to publish');
  const uploaded = await uploadAttachment(file, 'downloads');

  const doc = await DownloadDoc.create({
    title: body.title,
    description: body.description || '',
    category: body.category || 'Other',
    fileUrl: uploaded.url,
    fileName: file.originalname,
    fileSize: file.size ?? 0,
    fileType: file.mimetype ?? '',
    year: body.year || '',
    isPublished:
      body.isPublished === undefined || body.isPublished === true || body.isPublished === 'true',
    createdBy: officerId,
  });

  await writeAudit({
    actorId: officerId,
    actorRole: ROLES.OFFICER,
    action: 'download.create',
    entity: 'downloads',
    entityId: doc.id,
    after: { title: doc.title },
  });
  return shape(doc);
}

export async function updateDocument(id, officerId, body, file) {
  const doc = await DownloadDoc.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!doc) throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Document not found');

  for (const key of ['title', 'description', 'category', 'year']) {
    if (body[key] !== undefined) doc[key] = body[key] || '';
  }
  if (body.isPublished !== undefined) {
    doc.isPublished = body.isPublished === true || body.isPublished === 'true';
  }
  if (file) {
    const prev = doc.fileUrl;
    const uploaded = await uploadAttachment(file, 'downloads');
    doc.fileUrl = uploaded.url;
    doc.fileName = file.originalname;
    doc.fileSize = file.size ?? 0;
    doc.fileType = file.mimetype ?? '';
    await deleteAsset(prev);
  }

  await doc.save();
  await writeAudit({
    actorId: officerId,
    actorRole: ROLES.OFFICER,
    action: 'download.update',
    entity: 'downloads',
    entityId: doc.id,
    after: { title: doc.title },
  });
  return shape(doc);
}

export async function deleteDocument(id, officerId) {
  const doc = await DownloadDoc.findOne({ _id: id, isActive: true }).catch(() => null);
  if (!doc) throw new AppError(404, 'DOCUMENT_NOT_FOUND', 'Document not found');
  doc.isActive = false;
  await doc.save();
  await writeAudit({
    actorId: officerId,
    actorRole: ROLES.OFFICER,
    action: 'download.delete',
    entity: 'downloads',
    entityId: doc.id,
  });
  return { id: doc.id };
}
