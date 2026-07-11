# Administrator (Officer) Manual

The officer portal is the back-office for Grampanchayat staff. It is **not** a PWA — use it in a
desktop browser over HTTPS.

## Sign in

Open the admin URL → **Sign in** with your officer email and password. Accounts are created by
seeding or by an existing administrator (see Operations Manual). Sessions last 8 hours.

## Dashboard

Landing page shows live metrics (citizens, complaints, certificates, notices, schemes, tax
dues), complaint charts (by category/status), recent complaints/certificates, and an activity
feed from the audit log. A connectivity banner warns if you go offline.

## Complaints

- **Complaints** — list with search, filter (status/category), and sortable columns.
- Open a complaint → review details, photos, and location → change **status** (Pending →
  In Progress → Resolved) with remarks. The citizen is notified; the change is audited.

## Certificates (Dakhala)

- **Certificates** — list and filter by status.
- Open an application → **Review** (marks Under Review) → **Approve** (auto-generates the PDF,
  notifies the citizen) or **Reject** (reason required). All actions are audited.

## Notices

- Create, edit, publish/archive, and delete notices (optional PDF/image attachment).
- **Broadcast** a notice to citizens via SMS/voice + in-app (rate-limited).

## Schemes

Create, edit, publish/unpublish, and delete government schemes (optional image). Published
schemes appear to citizens.

## Tax

- **Look up** a citizen by mobile.
- Create tax records (type, year, amount, property number); balance/status derive automatically.
- Record payments (updates balance + status: Unpaid → Partial → Paid); view history.

## Users

List citizens/officers (search, filter by role/status). Open a user to view details or
**activate/deactivate** the account. You cannot deactivate your own account.

## Notifications

- **Notifications** — view all sent notifications with filters and delivery stats.
- **Broadcast** — send an in-app/SMS/voice message to all citizens (rate-limited).
- Retry a failed notification.

## Good practice

- Add remarks when changing complaint status — citizens see them.
- Keep broadcasts concise (SMS length cap applies to summaries).
- Every mutating action is recorded in the audit trail with your identity.
