# Version History

The product was built in 13 milestones as vertical slices (shared contract → backend →
tests → citizen UI → admin UI → verify) per the execution plan.

| Version   | Milestone | Summary                                                                                  |
| --------- | --------- | ---------------------------------------------------------------------------------------- |
| 0.1.0     | M1        | Monorepo foundation, shared contract, health endpoint, app shells                        |
| 0.2.0     | M2        | Authentication (citizen + officer), JWT, role gates                                      |
| 0.3.0     | M3        | Complaints (file/track, photos, GPS, status)                                             |
| 0.4.0     | M4        | Notices (CRUD, publish, attachments)                                                     |
| 0.5.0     | M5        | Government schemes                                                                       |
| 0.6.0     | M6        | Tax records + payments                                                                   |
| 0.7.0     | M7        | Certificates (Dakhala) + PDF generation                                                  |
| 0.8.0     | M8        | Officer dashboard + user management + personalized citizen home                          |
| 0.9.0     | M9        | Centralized notifications + provider abstraction                                         |
| 0.10.0    | M10       | PWA — offline, install, i18n, complaint idempotency                                      |
| 0.11.0    | M11       | Production hardening — security, rate limiting, monitoring, reliability, a11y            |
| 0.12.0    | M12       | Testing, documentation & final QA (85%+ coverage, RTL, Playwright, OpenAPI/Postman, UML) |
| **1.0.0** | **M13**   | **Production deployment, DevOps & final release**                                        |

## v1.0.0 (M13) changes

- Liveness/readiness/metrics endpoints; graceful shutdown + crash handlers.
- Structured JSON production logging; production env sanity guards.
- Prometheus-format metrics; provider-agnostic monitoring seams.
- Deployment configs: Render blueprint + Vercel projects; GitHub Actions CI.
- Operations/admin/user/maintenance manuals, deployment + Atlas + backup + security guides,
  release notes, roadmap, UAT report.
- Backend tests 157 → 166; coverage held at 85%+ statements / 89%+ lines.

## Conventions

Semantic versioning. Conventional commits. One `feature/<name>` branch per milestone, merged
to `main`. `v1.0.0` is the first production tag.
