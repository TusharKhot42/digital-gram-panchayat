# Backup & Recovery Plan

## Backup schedule

| Tier                    | Method                                | Frequency          | Retention                         |
| ----------------------- | ------------------------------------- | ------------------ | --------------------------------- |
| Atlas M10+              | Cloud Backup (continuous + snapshots) | Continuous / daily | 7 daily, 4 weekly                 |
| Atlas M0 / self-managed | `mongodump` cron                      | Daily 02:00 IST    | 7 days rolling, 1 monthly offsite |
| Uploaded media          | Cloudinary (durable) + monthly export | Monthly            | 3 months                          |

### Scheduled dump (M0 / VM)

```bash
# /etc/cron.d/dgp-backup — daily 02:00
0 2 * * *  app  mongodump --uri="$MONGODB_URI" --archive=/backups/dgp-$(date +\%F).gz --gzip
# prune older than 7 days
0 3 * * *  app  find /backups -name 'dgp-*.gz' -mtime +7 -delete
```

Store a copy off-site (S3/GCS) with encryption at rest.

## Restore procedure

```bash
# full restore into a fresh/target database
mongorestore --uri="$MONGODB_URI" --archive=/backups/dgp-2026-07-11.gz --gzip --drop
```

- `--drop` replaces existing collections — restore into a **staging** DB first and verify.
- Atlas: **Backup → Restore** to a new cluster, validate, then repoint `MONGODB_URI`.
- After restore: run `GET /health/ready`, spot-check counts, and confirm indexes exist.

## Disaster recovery checklist

1. **Declare + freeze:** stop writes (scale API to 0 or maintenance mode).
2. **Assess:** identify last-good backup/snapshot and data-loss window (RPO).
3. **Restore:** to a new/clean cluster from the chosen snapshot.
4. **Verify:** indexes present, record counts sane, officer login works, one end-to-end
   citizen journey passes.
5. **Repoint:** update `MONGODB_URI` in Render → redeploy → `/health/ready` green.
6. **Reconcile media:** confirm Cloudinary assets resolve; re-upload from export if needed.
7. **Resume + monitor:** re-enable traffic, watch error ratio + latency for 30 min.
8. **Post-mortem:** document cause, timeline, and preventive actions.

### Targets

- **RPO** (max data loss): ≤ 24h (M0 daily) / near-zero (continuous backup).
- **RTO** (max downtime): ≤ 1h for a clean Atlas snapshot restore.

## Secrets recovery

JWT secret / DB creds / Cloudinary keys live only in the Render dashboard (and a sealed
password manager). If rotated, update Render env and redeploy; JWT rotation invalidates active
sessions (users re-login).
