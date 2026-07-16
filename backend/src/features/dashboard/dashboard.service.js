import { User } from '../auth/user.model.js';
import { Complaint } from '../complaints/complaint.model.js';
import { Notice } from '../notices/notice.model.js';
import { Scheme } from '../schemes/scheme.model.js';
import { TaxRecord } from '../tax/tax.model.js';
import { CertificateApplication } from '../certificates/certificate.model.js';
import { AuditLog } from '../audit/audit.model.js';
import { env } from '../../config/env.js';

// 60s in-memory cache (blueprint 5.8). Disabled outside production so tests and dev see
// fresh aggregates immediately.
const CACHE_TTL_MS = 60_000;
const cache = new Map();

async function cached(key, producer) {
  if (env.NODE_ENV !== 'production') return producer();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;
  const value = await producer();
  cache.set(key, { value, at: Date.now() });
  return value;
}

/** Aggregated counts. Each is a single count/aggregation, all run in parallel (no N+1). */
export async function getMetrics() {
  return cached('metrics', async () => {
    const [
      totalCitizens,
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      totalNotices,
      totalSchemes,
      totalCertificates,
      approvedCertificates,
      totalTaxRecords,
      outstandingAgg,
    ] = await Promise.all([
      User.countDocuments({ role: 'citizen' }),
      Complaint.countDocuments({}),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Notice.countDocuments({ isActive: true }),
      Scheme.countDocuments({ isActive: true }),
      CertificateApplication.countDocuments({ isActive: true }),
      CertificateApplication.countDocuments({ isActive: true, status: 'Approved' }),
      TaxRecord.countDocuments({ isActive: true }),
      TaxRecord.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$balance' } } },
      ]),
    ]);

    return {
      totalCitizens,
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      totalNotices,
      totalSchemes,
      totalCertificates,
      approvedCertificates,
      totalTaxRecords,
      outstandingTax: outstandingAgg[0]?.total ?? 0,
    };
  });
}

/** Complaint distribution charts via aggregation pipelines. */
export async function getCharts() {
  return cached('charts', async () => {
    const [byCategory, byStatus] = await Promise.all([
      Complaint.aggregate([
        { $group: { _id: '$category', value: { $sum: 1 } } },
        { $project: { _id: 0, label: '$_id', value: 1 } },
        { $sort: { value: -1 } },
      ]),
      Complaint.aggregate([
        { $group: { _id: '$status', value: { $sum: 1 } } },
        { $project: { _id: 0, label: '$_id', value: 1 } },
      ]),
    ]);
    return { complaintsByCategory: byCategory, complaintsByStatus: byStatus };
  });
}

/** Recent activity feed from the audit trail. */
export async function getActivity(limit = 15) {
  const logs = await AuditLog.find({}).sort({ at: -1 }).limit(limit).lean();
  return logs.map((l) => ({
    id: String(l._id),
    action: l.action,
    entity: l.entity,
    actorRole: l.actorRole,
    at: l.at,
  }));
}

/**
 * Reports module: per-module breakdowns behind the officer Reports page. Groupings run as
 * parallel aggregations; the same 60s production cache as the other dashboard endpoints.
 */
export async function getReport() {
  return cached('report', async () => {
    const group = (Model, field, match = {}) =>
      Model.aggregate([
        { $match: match },
        { $group: { _id: `$${field}`, value: { $sum: 1 } } },
        { $project: { _id: 0, label: '$_id', value: 1 } },
        { $sort: { value: -1 } },
      ]);

    const [
      complaintsByStatus,
      complaintsByCategory,
      certificatesByStatus,
      certificatesByType,
      taxByStatus,
      taxTotals,
      usersByActive,
      schemesByPublished,
      noticesByCategory,
      noticesPublished,
      totalComplaints,
      totalCertificates,
      totalTaxRecords,
      totalCitizens,
      totalSchemes,
      totalNotices,
    ] = await Promise.all([
      group(Complaint, 'status'),
      group(Complaint, 'category'),
      group(CertificateApplication, 'status', { isActive: true }),
      group(CertificateApplication, 'certificateType', { isActive: true }),
      group(TaxRecord, 'paymentStatus', { isActive: true }),
      TaxRecord.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            assessed: { $sum: '$amount' },
            collected: { $sum: '$amountPaid' },
            outstanding: { $sum: '$balance' },
          },
        },
      ]),
      group(User, 'isActive', { role: 'citizen' }),
      group(Scheme, 'isPublished', { isActive: true }),
      group(Notice, 'category', { isActive: true }),
      Notice.countDocuments({ isActive: true, isPublished: true }),
      Complaint.countDocuments({}),
      CertificateApplication.countDocuments({ isActive: true }),
      TaxRecord.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'citizen' }),
      Scheme.countDocuments({ isActive: true }),
      Notice.countDocuments({ isActive: true }),
    ]);

    const totals = taxTotals[0] ?? { assessed: 0, collected: 0, outstanding: 0 };

    return {
      generatedAt: new Date().toISOString(),
      complaints: {
        total: totalComplaints,
        byStatus: complaintsByStatus,
        byCategory: complaintsByCategory,
      },
      certificates: {
        total: totalCertificates,
        byStatus: certificatesByStatus,
        byType: certificatesByType,
      },
      tax: {
        total: totalTaxRecords,
        assessed: totals.assessed,
        collected: totals.collected,
        outstanding: totals.outstanding,
        byStatus: taxByStatus,
      },
      users: { total: totalCitizens, byActive: usersByActive },
      schemes: { total: totalSchemes, byPublished: schemesByPublished },
      notices: { total: totalNotices, published: noticesPublished, byCategory: noticesByCategory },
    };
  });
}
