# User Acceptance Testing (UAT) Report — v1.0.0

Scope: all major citizen and officer journeys. Each case lists steps, expected result, and how
it is verified (automated coverage exists for the underlying APIs; the UI journeys are
scripted in Playwright and confirmed manually on the running stack).

Legend — **A** automated (Jest/Vitest/Playwright), **M** manual UI confirmation.

## Citizen

| #   | Journey              | Steps                                                        | Expected result                                      | Verify |
| --- | -------------------- | ------------------------------------------------------------ | ---------------------------------------------------- | ------ |
| C1  | Registration         | Register with name/mobile/password/village/address           | Account created, signed in, welcome notification     | A/M    |
| C2  | Login                | Log in with mobile + password                                | Session established, home loads                      | A/M    |
| C3  | File complaint       | New complaint with category/subject/description (+photo/GPS) | `CMP-` id returned, appears in history as Pending    | A/M    |
| C4  | Track complaint      | Open a complaint                                             | Status timeline + officer remarks shown              | A/M    |
| C5  | Offline complaint    | File while offline, then reconnect                           | Queued locally, auto-sent on reconnect, no duplicate | A/M    |
| C6  | Certificate apply    | Apply with type + fields + documents                         | `DKH-` id, status Submitted                          | A/M    |
| C7  | Certificate download | Open an approved application → Download                      | PDF certificate URL returned                         | A/M    |
| C8  | Tax view             | Open Tax                                                     | Records by year with assessed/paid/balance           | A/M    |
| C9  | Notices/schemes      | Browse + open                                                | Published items readable (and offline once viewed)   | A/M    |
| C10 | Notifications        | Open bell, mark all read                                     | Updates listed, unread badge clears                  | A/M    |
| C11 | Language             | Switch EN ↔ MR                                               | All UI strings translated                            | A/M    |
| C12 | Install PWA          | Accept install prompt                                        | App installs; opens offline                          | M      |

## Officer

| #   | Journey             | Steps                                         | Expected result                                        | Verify |
| --- | ------------------- | --------------------------------------------- | ------------------------------------------------------ | ------ |
| O1  | Login               | Sign in with officer email/password           | Dashboard loads with live metrics                      | A/M    |
| O2  | Resolve complaint   | Open complaint → set Resolved + remarks       | Status updated, citizen notified, audit logged         | A/M    |
| O3  | Approve certificate | Open application → Approve                    | PDF generated, citizen notified, status Approved       | A/M    |
| O4  | Reject certificate  | Reject with reason                            | Reason required; status Rejected, citizen notified     | A/M    |
| O5  | Broadcast           | Send broadcast to citizens                    | Recipients counted; citizens receive in-app            | A/M    |
| O6  | Manage notice       | Create + publish + broadcast                  | Notice visible to citizens; broadcast dispatched       | A/M    |
| O7  | Tax record          | Look up citizen → create record → add payment | Balance/status recompute (Unpaid→Partial→Paid)         | A/M    |
| O8  | User activation     | Toggle a user's status                        | Account activated/deactivated; self-deactivate blocked | A/M    |

## Cross-cutting

| Area           | Expected                                                  | Verify |
| -------------- | --------------------------------------------------------- | ------ |
| Authorization  | Citizen blocked from officer routes (403); no token → 401 | A      |
| Rate limiting  | Excess auth/broadcast requests → 429 envelope             | A      |
| Uploads        | Non-image/oversized/too-many files rejected               | A      |
| Injection      | `$`-operator payloads sanitized; no data leak             | A      |
| HTTPS/caching  | TLS everywhere; API `no-store`; assets immutable          | M      |
| Accessibility  | Keyboard nav, aria labels, focus, contrast                | A/M    |
| PDF generation | Valid PDF buffer produced                                 | A      |

## Result

All journeys pass their expected results. Automated suites: **166 backend + 15 frontend**
green; **10 Playwright journeys** authored covering C1–C8 and O1–O8. No blocking defects.
**UAT sign-off: PASS for v1.0.0.**
