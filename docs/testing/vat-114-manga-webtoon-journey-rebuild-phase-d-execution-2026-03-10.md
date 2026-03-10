# VAT-114 — [Manga/Webtoon] Rebuild journey theo spec mới (Phase D execution, doc_only)

- Ticket: https://linktovn.atlassian.net/browse/VAT-114
- Parent Epic (SoT): https://linktovn.atlassian.net/browse/VAT-110
- Date: 2026-03-10
- Strategy: `doc_only`
- Scope: story-level consolidation + Phase D telemetry gate handover cho VAT-114 (không thay đổi runtime/API/UI code).

---

## 1) Jira context read-first (executed before writing)

- Issue key: `VAT-114`
- Summary: `[Manga/Webtoon] Rebuild journey theo spec mới (entry → onboarding → generation flow) từ VAT-110 SoT`
- Type: `Story`
- Parent: `VAT-110`
- Start status: `To Do`
- Labels: `dual-journey`, `manga-webtoon`, `vat-110-reset`
- Subtasks observed:
  - `VAT-117` — Done
  - `VAT-118` — Done
  - `VAT-119` — Done
  - `VAT-120` — Done

Read evidence: Jira REST `/issue/VAT-114` + `/issue/VAT-110` fetched before execution.

---

## 2) Scope guard (strictly VAT-114)

This pass only closes the story-level documentation lane for VAT-114 by consolidating child outputs into one execution snapshot and aligning with VAT-110 SoT.

In scope:
1. Confirm VAT-114 is anchored to VAT-110 SoT direction.
2. Consolidate child deliverables VAT-117/118/119/120 into one story-level closure note.
3. Freeze Phase D telemetry-gate readiness note for rollout handoff.

Out of scope:
- No code/runtime/API/UI changes.
- No production deploy.
- No schema/contract implementation changes in this pass.

---

## 3) VAT-110 SoT alignment check (for VAT-114)

VAT-114 implementation intent remains aligned with VAT-110 reset direction:

1. Keep **dual-journey semantics** explicit at product level (`manga_webtoon` vs `film_video`).
2. Reuse legacy runtime capabilities only as compatibility bridge (not as semantic source of truth).
3. Keep transition safe via telemetry/compatibility checks before deeper runtime separation.

---

## 4) Child artifact consolidation (VAT-114 chain)

### 4.1 VAT-117 (mapping matrix)
- Output: mapping final analysis/spec -> implementable acceptance criteria.
- Role in story: turns analysis into execution-ready AC list.

### 4.2 VAT-118 (IA + screen-flow)
- Output: detailed IA/screen-flow blueprint for Manga/Webtoon lane from entry -> create -> onboarding.
- Role in story: product-flow blueprint for journey rebuild.

### 4.3 VAT-119 (compatibility checklist)
- Output: adapter contract checklist to avoid breaking quickManga/history continuity.
- Role in story: backward-compatibility guardrail.

### 4.4 VAT-120 (test/UAT + telemetry assertions)
- Output: UAT/test matrix and mandatory telemetry dimensions.
- Role in story: Phase D telemetry gate readiness baseline.

---

## 5) Phase D (Telemetry gate) readiness statement for VAT-114

Per SoT (`docs/ux/vat-dual-journey-separation-final-analysis-2026-03-10.md`), Phase D requires stable dual-journey funnel observability before deprecating old signals.

VAT-114 now has required planning artifacts for this gate:
- Journey semantics + AC map: VAT-117
- Journey screen-flow blueprint: VAT-118
- Compatibility adapter contract checklist: VAT-119
- UAT + telemetry assertion plan: VAT-120

Mandatory dimensions (as frozen in chain artifacts):
- `journeyType`
- `entryIntent`
- `templateId`
- `locale`
- `projectId`

Story-level conclusion: **VAT-114 doc lane is execution-ready and can be marked Done** (planning/doc scope complete).

---

## 6) Definition of done (story doc lane)

- [x] Jira context read first (VAT-114 + VAT-110).
- [x] Scope kept strictly at VAT-114 story level.
- [x] Child artifacts VAT-117/118/119/120 consolidated.
- [x] Phase D telemetry-gate handover statement recorded.
- [ ] Jira comment evidence (to attach after posting).
- [ ] Jira status transition evidence (to attach after transition).

---

## 7) Evidence pointers

- This file: `docs/testing/vat-114-manga-webtoon-journey-rebuild-phase-d-execution-2026-03-10.md`
- Story: https://linktovn.atlassian.net/browse/VAT-114
- SoT Epic: https://linktovn.atlassian.net/browse/VAT-110
