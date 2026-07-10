# Database Guide

MongoDB via Mongoose. One database, one collection per domain model. Human-readable IDs
(`CMP-`, `NTC-`, `SCH-`, `TAX-`, `DKH-`) come from an atomic per-year `counters` collection.

## Collections

| Collection                | Purpose                                  | Key indexes                                                  |
| ------------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| `users`                   | citizens + officers (role discriminator) | `mobile` (sparse unique), `email` (sparse unique), `role`    |
| `complaints`              | citizen complaints                       | `citizenId+status`, `status`, `createdAt`, `complaintId`     |
| `notices`                 | announcements                            | `noticeId`, `isPublished`, `category`, `createdAt`           |
| `schemes`                 | government schemes                       | `schemeId`, `isPublished`, `category`                        |
| `taxrecords`              | property/water tax                       | `citizenId`, `taxRecordId`, `financialYear`, `paymentStatus` |
| `certificateapplications` | Dakhala applications                     | `applicationId`, `citizenId+status`, `status`                |
| `notifications`           | in-app/SMS/voice/email                   | `recipientId+read`, `notificationId`, `status`               |
| `auditlogs`               | append-only audit trail                  | `entity+entityId`, `actorId`, `at`                           |
| `idempotencykeys`         | request replay store                     | unique `key`, TTL 24h on `createdAt`                         |
| `counters`                | atomic sequence generator                | `_id`                                                        |

## Conventions

- **Soft delete:** records carry `isActive`; deletes flip it to `false` (never hard-delete).
- **Timestamps:** Mongoose `createdAt`/`updatedAt` on business models.
- **toJSON transform:** exposes `id`, strips `_id`/`__v` and sensitive fields (`passwordHash`).
- **Money:** integers (paise-safe), `balance = amount − amountPaid`, status derived.
- **Audit:** every mutation writes an `auditlogs` entry (non-blocking).

## Query practices (see production-hardening.md)

Pagination on every list, `Promise.all` for list+count, aggregation for dashboard metrics,
`.select().lean()` for internal reads, TTL index for idempotency cleanup.

## Seeding

```bash
$env:SEED_ADMIN_EMAIL="admin@dgp.local"; $env:SEED_ADMIN_PASSWORD="Admin@123"; npm run seed:admin -w backend
```

## Backup / restore

```bash
mongodump  --uri="$MONGODB_URI" --out=backup/
mongorestore --uri="$MONGODB_URI" backup/
```
