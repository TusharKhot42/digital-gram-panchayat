# Tax Records API (Milestone 6)

Base: `/api/v1`. Envelope `{ success, data }` / `{ success, error }`. JWT required.
Citizens are **view-only** — there is no online payment; officers record payments manually.

## Payment / history model

`payments[]` and `history[]` are **embedded** in the tax record. Payments are bounded per record,
have no independent lifecycle, and are always read with the record, so embedding gives an atomic
append and avoids joins (blueprint: embed bounded sub-arrays). `history[]` is **append-only** — every
amount change and payment pushes an entry; prior values are never overwritten (SRS transparency).
`balance` and `paymentStatus` (Unpaid / Partial / Paid) are derived on every mutation.

## Citizen (view-only)

### GET /tax/mine

The caller's own records. Query: `taxType` (Property|Water), `financialYear` (e.g. 2025-2026).
`200` → `{ data: TaxRecord[], totalDues }`.

## Officer — role **officer**

### GET /admin/tax

List with filter + pagination. Query: `q` (taxRecordId/propertyNumber), `taxType`, `paymentStatus`,
`financialYear`, `citizenId`, `page`, `limit`. `200` → `{ data, total, page, limit }`.

### GET /admin/tax/lookup?mobile=

Resolve a citizen by mobile (tax-scoped convenience). `200` → `{ id, fullName, mobile, village }`,
`404` if none. `400` on invalid mobile.

### GET /admin/tax/:id · GET /admin/tax/:id/history

Single record; `history` returns `{ history, payments }`.

### POST /admin/tax

Create. Body: `{ citizenId, propertyNumber, taxType, financialYear, amount, dueDate? }`.
`amount >= 0`. `201` → the record (`taxRecordId` like `TAX-2026-000001`, `balance = amount`, Unpaid).
`404` if the citizen doesn't exist.

### PATCH /admin/tax/:id

Update `propertyNumber` / `amount` / `dueDate`. Each change appends a history entry; balance +
status recomputed. `amount >= 0`.

### POST /admin/tax/:id/payment

Body: `{ amount, paidAt?, receiptNo?, mode? }`. `amount > 0` and **≤ current balance**
(`400 PAYMENT_EXCEEDS_BALANCE` otherwise). Appends to `payments[]` + `history[]`, recomputes totals.
`201` → the updated record.

## Notes

- Every create / update / payment writes an `auditlogs` entry (`tax.create` / `tax.update` /
  `tax.payment`).
- Records are soft-deletable via `isActive` (no delete endpoint exposed this milestone).
- Sequential ids from the atomic `counters` collection, keyed per year.
