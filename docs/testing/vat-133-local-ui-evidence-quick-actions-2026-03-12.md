# VAT-133 — Local UI/quick-actions evidence (2026-03-12)

## Scope
- Ticket: VAT-133
- Branch: `work/vat-manga-webtoon-lane-20260312`
- Goal: bổ sung evidence local thực tế cho webtoon panel quick actions (add/duplicate/split/merge/reorder).

## What was verified (local-safe)

### 1) Targeted regression tests (quick-actions lane)
Command:
```bash
npx vitest run tests/unit/workspace/webtoon-panel-controls.test.ts tests/unit/workspace/stage-alias.test.ts tests/unit/workspace/stage-navigation-lane.test.ts
```
Result:
- PASS `17/17`
- Log artifact: `docs/testing/artifacts/vat-133-local-ui-evidence-2026-03-12/vitest.log`

### 2) Deterministic mutation-plan evidence (before/after order + operation intent)
Added a small evidence script (no production behavior change):
- `scripts/vat-133-quick-actions-evidence.ts`

Command:
```bash
npx tsx scripts/vat-133-quick-actions-evidence.ts > docs/testing/artifacts/vat-133-local-ui-evidence-2026-03-12/quick-actions-plan.json
```
Generated artifact:
- `docs/testing/artifacts/vat-133-local-ui-evidence-2026-03-12/quick-actions-plan.json`

This artifact records, per action:
- `beforeOrder`
- `deletePanelIds`
- `createCount`
- `expectedAfterOrder`
- payload preview (shotType/cameraMove/description/duration)

### 3) Key before/after evidence snapshots
From `quick-actions-plan.json`:
- **split**
  - before: `[p1,p2,p3]`
  - delete: `[p2]`
  - createCount: `2`
  - after: `[p1,__new_split_left_of_p2__,__new_split_right_of_p2__,p3]`
- **merge**
  - before: `[p1,p2,p3]`
  - delete: `[p2,p1]`
  - createCount: `1`
  - after: `[__new_merge_p1_p2__,p3]`
- **reorder**
  - before: `[p1,p2,p3]`
  - delete: `[p1]`
  - createCount: `1`
  - after: `[p2,p3,p1]`

## Notes on UI runtime constraints in this local session
- Local dev app startup on this runner had DB/Redis unavailable (`localhost:3306`, `localhost:6379`), so full interactive signed-in workspace flow was blocked in-session.
- To keep progress auditable and staging-safe, evidence was captured through:
  - passing targeted tests,
  - deterministic before/after mutation artifact,
  - existing quick-action plan logging path already present in UI component (`[VAT-133][quick-action-plan]`).

## Auditability
All evidence files are versioned and reproducible by command lines above.
