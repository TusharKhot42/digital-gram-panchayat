# Future Enhancement Roadmap (Phase 2)

v1.0.0 delivers the full capstone scope. The following are candidate enhancements — none are
required for the current release.

## Security & auth

- Refresh-token rotation + server-side revocation (logout everywhere).
- Account lockout / CAPTCHA after repeated failed logins.
- OTP-based mobile verification at registration.
- Dependabot + `npm audit` gate in CI; periodic penetration testing.
- Edge WAF / DDoS protection.

## Payments & tax

- Online payment gateway (UPI/cards) for tax dues with receipts.
- Auto-reminders for due/overdue tax via SMS.

## Notifications

- Real SMS/voice/email providers (Twilio/MSG91/SMTP) wired behind the existing abstraction.
- WhatsApp channel; push notifications (Web Push) for the PWA.
- Per-event user preferences honoured server-side.

## Citizen experience

- Two-way complaint chat / attachments from officers.
- Document wallet (reuse uploaded documents across applications).
- Map view of complaints; ward-level filtering.
- More languages beyond EN/MR.

## Officer / admin

- Role granularity (clerk vs administrator) and per-module permissions.
- Bulk actions and CSV export/import for tax and users.
- SLA timers and escalation for complaints.
- Configurable certificate templates.

## Platform & ops

- Sentry + Grafana/Prometheus wired in production (seams already in place).
- Horizontal scaling + Redis-backed rate limiting and idempotency store.
- Blue/green or canary deploys.
- Full Playwright suite in CI against a preview environment.
- Data retention/archival policy for audit logs.

## Analytics

- Officer analytics (resolution times, category trends, scheme uptake).
- Public transparency dashboard.
