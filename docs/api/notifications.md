# Notification & Communication API (Milestone 9)

Base: `/api/v1`. Envelope `{ success, data }` / `{ success, error }`. JWT required.

## Architecture

```
Business module (auth / complaint / notice / scheme / tax / certificate)
        │  notify({ recipientId, title, message, channels, module, ... })
        ▼
Notification Service ──► creates Notification (status: queued) ──► Audit (created)
        │
        ▼
Notification Queue  (in-process today; BullMQ/RabbitMQ-ready seam)
        │  deliver(job)
        ▼
Provider Interface  { channel, send(msg) -> { status, providerMessageId?, error? } }
        ├── SMS Provider     (mock | Twilio | MSG91)
        ├── Voice Provider   (mock; pre-recorded flow)
        ├── Email Provider   (optional, pluggable)
        └── (future) Push / WhatsApp
        │
        ▼
Notification updated (sent | delivered | failed) ──► Audit (sent/delivered/failed)
```

Every notification is also an **in-app** record (the notification centre); `channels` lists
external dispatches, `channel` is the primary one. Business modules never import a provider.

## Citizen / any authenticated user — `/notifications`

| Method | URL                         | Notes                                                                                                         |
| ------ | --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| GET    | /notifications              | own list; query `unread=true`, `module`, `q`, `page`, `limit`; returns `{ data, total, page, limit, unread }` |
| GET    | /notifications/unread-count | `{ unread }`                                                                                                  |
| GET    | /notifications/:id          | own notification                                                                                              |
| PATCH  | /notifications/:id/read     | mark one read (owner only; `403` otherwise)                                                                   |
| PATCH  | /notifications/read-all     | mark all own read                                                                                             |

## Officer — `/admin/notifications`

| Method | URL                            | Notes                                                                                |
| ------ | ------------------------------ | ------------------------------------------------------------------------------------ |
| GET    | /admin/notifications           | all; filter `status`, `channel`, `module`, `q`, paginate                             |
| GET    | /admin/notifications/stats     | `{ total, byStatus[], byChannel[] }`                                                 |
| GET    | /admin/notifications/:id       | one                                                                                  |
| POST   | /admin/notifications/broadcast | `{ title, message, type?, targetRole?, channels? }` → `{ recipientCount, channels }` |
| POST   | /admin/notifications/:id/retry | re-queue a **failed** notification (`400` if not failed / max retries)               |

## Providers

Selected by env. `SMS_PROVIDER=mock|twilio|msg91` (mock in dev/test). `EMAIL_PROVIDER` optional
(defaults to none → email channels report "skipped", never fail a notification). Twilio/MSG91 report
a clear failure until their credentials + client are added — the retry path is exercisable.

## Audit events

`notification.created`, `.sent`, `.delivered`, `.failed`, `.read`, `.retried`, `.broadcast`.

## Notes

- `notificationId` is UUID-based and collision-proof — a notification never fails the calling
  business operation.
- Queue is queue-ready: swapping to BullMQ means reimplementing `enqueue`/worker; callers unchanged.
- Retry policy: up to `NOTIFICATION_MAX_RETRIES` (3).
