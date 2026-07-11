# MongoDB Atlas Configuration Guide

## Cluster setup

1. Atlas → create a project → **Build a Database** (M0 free tier is fine for the capstone;
   M10+ for production traffic).
2. Region closest to users (e.g. Mumbai `ap-south-1`).
3. **Database Access:** create a user with a strong password and `readWrite` on the app DB.
4. **Network Access:** allowlist the Render egress IPs (or `0.0.0.0/0` only for a demo — never
   for real production).
5. Copy the SRV connection string into `MONGODB_URI`
   (`mongodb+srv://user:pass@cluster.mongodb.net/digital_gram_panchayat?retryWrites=true&w=majority`).

## Indexes

Indexes are declared in the Mongoose models and created automatically on connect
(`autoIndex` is on outside production). **For production, build them explicitly once** to avoid
a startup penalty, then keep `autoIndex` off:

| Collection              | Indexes                                                      |
| ----------------------- | ------------------------------------------------------------ |
| users                   | `mobile` (sparse unique), `email` (sparse unique), `role`    |
| complaints              | `citizenId+status`, `status`, `createdAt`, `complaintId`     |
| notices                 | `noticeId`, `isPublished`, `category`, `createdAt`           |
| schemes                 | `schemeId`, `isPublished`, `category`                        |
| taxrecords              | `citizenId`, `taxRecordId`, `financialYear`, `paymentStatus` |
| certificateapplications | `applicationId`, `citizenId+status`, `status`                |
| notifications           | `recipientId+read`, `notificationId`, `status`               |
| auditlogs               | `entity+entityId`, `actorId`, `at`                           |
| idempotencykeys         | unique `key`, **TTL 24h** on `createdAt`                     |
| counters                | `_id`                                                        |

Verify in Atlas → Collections → Indexes, or `db.<collection>.getIndexes()` in `mongosh`.

## Backups

- **Atlas Backup:** enable Cloud Backup (continuous / daily snapshots) on M10+. On M0, use
  scheduled `mongodump` (see [backup-recovery.md](backup-recovery.md)).
- Retention: 7 daily + 4 weekly snapshots recommended.

## Connection monitoring

- Atlas **Metrics**: connections, opcounters, replication lag, disk IOPS.
- Atlas **Alerts**: high connections (> 80% of limit), replication lag, low disk, primary
  elections. Route to email/Slack.
- App side: `GET /api/v1/health/ready` reflects live connectivity; `mongoose.connection`
  emits `error`/`disconnected` events (logged).

## Failover recommendations

- Use a **replica set** (default on Atlas paid tiers) — automatic primary election on failure.
- Driver retries: the SRV string already sets `retryWrites=true`; keep `w=majority` for
  durable writes.
- Deploy the API in the same region as the cluster to minimise latency.
- Set connection pool sizing via the URI (`maxPoolSize`) for higher tiers.
- Test failover in a staging project before go-live.
