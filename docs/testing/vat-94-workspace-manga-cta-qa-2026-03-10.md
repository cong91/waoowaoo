# VAT-94 Phase 1 QA Closure — Workspace Manga CTA (2026-03-10)

- Story: [VAT-94](https://linktovn.atlassian.net/browse/VAT-94)
- Parent Epic: [VAT-85](https://linktovn.atlassian.net/browse/VAT-85)
- Subtasks:
  - [VAT-95](https://linktovn.atlassian.net/browse/VAT-95) — card CTA responsive
  - [VAT-96](https://linktovn.atlassian.net/browse/VAT-96) — analytics view/click/conversion
  - [VAT-97](https://linktovn.atlassian.net/browse/VAT-97) — QA điều hướng end-to-end

## Baseline Phase 1 được kế thừa

Đối chiếu các commit baseline theo yêu cầu story:

- `f89a97aa9369729f0871b71a2b4bdccf8282dd33` — add manga quick-start entrypoints
- `e6968e553ec6e31befc10a5875a1f3bca05bac79` — relabel manga entry + persist toggle
- `d15c7e8` — i18n regression cho manga beta entrypoint
- `1dec56e` — harden quick manga session toggle persistence fallback
- `af9cd02` — guard session storage operations for manga toggle persist
- `f3b241f` — lock editor manga toggle regression flow
- `6d3a482` — baseline liên quan đã có trong branch/history Phase 1

## AC/DoD checklist (VAT-94)

### AC1 — Card CTA Manga hiển thị đúng desktop/mobile

- Evidence implementation: `src/app/[locale]/workspace/page.tsx`
  - Manga CTA card ở workspace grid.
  - Layout dùng utility responsive (`grid-cols-1 ... xl:grid-cols-4`, modal `p-3 sm:p-4`, `grid-cols-1 sm:grid-cols-2`).
- Kết luận: **PASS**.

### AC2 — Click CTA điều hướng đúng flow Manga

- Flow xác nhận:
  1. Click CTA card Manga tại workspace (`handleOpenCreateModal('manga')`).
  2. Tạo project với payload có `projectMode: 'manga'`.
  3. Sau create thành công, route tới `buildProjectEntryUrl(projectId, 'manga')`.
  4. URL đích: `/workspace/{projectId}?stage=script&quickManga=1`.
- Evidence code:
  - `src/app/[locale]/workspace/page.tsx`
  - `src/lib/workspace/project-mode.ts`
  - `tests/unit/helpers/workspace-project-mode.test.ts`
- Kết luận: **PASS**.

### AC3 — Có metric view/click/conversion cho CTA Manga

- Event coverage:
  - `workspace_manga_cta_view`
  - `workspace_manga_cta_click`
  - `workspace_project_mode_selected`
  - `workspace_project_created`
  - API-side conversion: `workspace_manga_conversion`
- Evidence code/test:
  - `src/lib/workspace/manga-discovery-analytics.ts`
  - `src/app/[locale]/workspace/page.tsx`
  - `src/app/api/projects/route.ts`
  - `tests/unit/helpers/manga-discovery-analytics.test.ts`
  - `tests/integration/api/contract/projects-route.test.ts`
- Kết luận: **PASS**.

## Bộ test xác nhận trong lần chốt VAT-94

```bash
npx vitest run \
  tests/unit/helpers/workspace-project-mode.test.ts \
  tests/unit/helpers/manga-discovery-analytics.test.ts \
  tests/integration/api/contract/projects-route.test.ts

npm run build
```

Kỳ vọng: tất cả PASS để đủ evidence cho VAT-95/96/97 và story VAT-94.

## Kết luận QA

- Scope VAT-94 (bao gồm VAT-95/96/97) đạt AC/DoD theo evidence code + test.
- Không có thay đổi deployment production trong hoạt động chốt ticket này.
