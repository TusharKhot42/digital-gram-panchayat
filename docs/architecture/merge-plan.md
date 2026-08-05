# Merge plan

`main` is **83 commits behind** the tip of the work. Nothing has landed since the early
modules. This has been flagged since Phase 2 and is the largest structural risk in the project:
every phase has been reviewed and verified in isolation, and none of it is on the default
branch.

**Nothing in this document has been executed.** It ends with commands to run after a decision.

## The finding that makes this easy

The 19 live branches are **one linear stack**, not 19 divergent lines of work. Verified with
`git merge-base --is-ancestor` across the chain — every branch is an ancestor of the next:

```
sakharale-homepage → public-village-portal → certificate-generation-system →
citizen-directory-dashboard → final-ui-ux-enhancement → responsive-ui-final →
premium-ui-redesign → premium-design-system → production-scale-hardening →
security-hardening → inapp-document-viewer → production-hardening-phase-2 →
portal-audit-stabilization → help-center → help-assistant →
final-ui-professionalization → final-citizen-experience →
smart-governance-modules → consolidation-hardening
```

Each branch simply has more commits than the one before it (15 → 12 → 21 → … → 83). They are
snapshots of one continuous history, not parallel features.

### Verified: the merge is a fast-forward with zero conflicts

Run against a throwaway branch off `main` and then aborted:

```
git checkout -b scratch/merge-probe main
git merge --no-commit --no-ff feature/consolidation-hardening
→ "Automatic merge went well; stopped before committing as requested"
→ git diff --name-only --diff-filter=U  →  0 files
git merge --abort
```

`git merge-base --is-ancestor main feature/consolidation-hardening` returns true, so `main` can
also simply fast-forward.

**83 commits, 225 files changed, 0 conflicts.**

## What this means for the decision

The interesting question is not "how do we resolve the conflicts" — there are none. It is
**how much history you want on `main`**.

| Option                             | Result                                                                                | When it is right                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **A — Fast-forward** (recommended) | `main` becomes the tip. All 83 commits and their messages preserved, no merge commit. | The history is the record. Each commit explains a decision; keep it.                                          |
| **B — One `--no-ff` merge commit** | Same content, plus a merge commit marking the landing.                                | You want a single "this is where it all landed" marker.                                                       |
| **C — Land branch by branch**      | 19 sequential fast-forwards.                                                          | You want to review or tag each phase separately as it lands.                                                  |
| **D — Squash**                     | One commit, 225 files.                                                                | **Not recommended.** It discards the reasoning in 83 messages, which is most of this project's documentation. |

Recommendation: **A**. The commit messages carry the _why_ for decisions that are not obvious
from the code (derived meeting status, the unique index on poll votes, the contrast-token
changes). Squashing throws that away for no benefit, since there is nothing to tidy — no
conflicts, no broken intermediate states.

Option C is the safest if you want CI to run on each phase, but note the caveat below.

## Caveat: intermediate commits do not all pass CI

The stack was verified at its **tip**, not at every commit. In particular, the backend coverage
gate was failing from `feature/smart-governance-modules` until it was fixed in
`feature/consolidation-hardening`. So:

- Options A, B and D land a tip that passes lint, tests, the coverage gate and both builds.
- **Option C will show a red CI run when `smart-governance-modules` lands**, going green again
  one branch later. That is honest history, not a fault, but expect it.

## Stale branches: 18 safe to delete

These are `0` commits ahead of `main` — their content is already merged. They are leftover
pointers, and four of them were already noted as such in an earlier phase.

```
feature/authentication                    feature/notice-board
feature/bugfix-enhancement-sprint         feature/notifications-hardening
feature/certificate-module-update         feature/production-deployment
feature/complaint-management              feature/production-hardening
feature/dakhala-module                    feature/production-storage-improvements
feature/dashboard-user-management         feature/pwa-offline
feature/final-professional-polish         feature/tax-records
feature/government-schemes                feature/testing-docs-qa
feature/login-documents-schemes           feature/ui-ux-refinement
```

Deleting them is safe by definition: `git branch -d` refuses to delete anything not fully
merged, so the command below cannot lose work.

## After landing: the 18 superseded stack branches

Once the tip is on `main`, every branch in the chain becomes `0` ahead too, and the same
`git branch -d` becomes safe for them. Consider tagging the phases first if the phase
boundaries are worth keeping as markers:

```bash
git tag phase-1-audit      feature/portal-audit-stabilization
git tag phase-2a-help      feature/help-center
git tag phase-2b-assistant feature/help-assistant
git tag phase-2-ui         feature/final-ui-professionalization
git tag phase-3-citizen    feature/final-citizen-experience
git tag phase-4-governance feature/smart-governance-modules
git tag phase-5-hardening  feature/consolidation-hardening
git push origin --tags
```

## Commands — option A, ready to run

Do not run these without deciding. Confirm the gate is green on the tip first.

```bash
# 0. Prove the tip is releasable
git checkout feature/consolidation-hardening
npm run lint && npm test && npm run test:coverage && npm run build

# 1. Land it
git checkout main
git pull --ff-only origin main
git merge --ff-only feature/consolidation-hardening

# 2. Push
git push origin main

# 3. Delete the 18 stale pointers (refuses if anything is unmerged)
git branch -d feature/authentication feature/bugfix-enhancement-sprint \
  feature/certificate-module-update feature/complaint-management \
  feature/dakhala-module feature/dashboard-user-management \
  feature/final-professional-polish feature/government-schemes \
  feature/login-documents-schemes feature/notice-board \
  feature/notifications-hardening feature/production-deployment \
  feature/production-hardening feature/production-storage-improvements \
  feature/pwa-offline feature/tax-records feature/testing-docs-qa \
  feature/ui-ux-refinement

# 4. Same on the remote, once you are satisfied
#    git push origin --delete <branch> ...
```

For option B, replace step 1's merge with:

```bash
git merge --no-ff feature/consolidation-hardening -m "merge: land phases 1-5"
```

## What is still not decided

Whether `main` should be protected and require CI to pass before a push. Right now nothing
stops a direct push to `main`, which is how it drifted 83 commits behind without anyone
noticing that the branch protection question had never been answered. That is a repository
setting, not a code change, and belongs to whoever owns the GitHub repo.
