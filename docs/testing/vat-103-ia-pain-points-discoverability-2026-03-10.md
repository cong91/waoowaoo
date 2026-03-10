# VAT-103 — Mapping current IA và pain points discoverability

- Ticket: https://linktovn.atlassian.net/browse/VAT-103
- Parent: https://linktovn.atlassian.net/browse/VAT-102
- Date: 2026-03-10
- Scope: **chỉ mapping IA hiện trạng + pain points discoverability** (không triển khai IA mới, không đổi runtime/API contract)

## 1) Jira context (read-first)

- VAT-103 (Sub-task) summary: **[Sub-task] Mapping current IA và pain points discoverability**
- Status at start: **To Do**
- Parent linkage: **VAT-102** (Story)

## 2) As-is IA map (current state)

## 2.1 Entry/discovery surfaces
1. Workspace card “New Project” và card “Manga” ở `src/app/[locale]/workspace/page.tsx`.
2. Create Project modal có lựa chọn `entryMode: story | manga` trong cùng file.
3. Project create payload map về `mode: "novel-promotion"` + `projectMode` qua `src/lib/workspace/project-mode.ts`.
4. Manga entry khi create xong đi qua `buildProjectEntryUrl(projectId, 'manga')` => `?stage=script&quickManga=1` (`src/lib/workspace/project-mode.ts`).
5. Runtime enable quick manga theo query parser `shouldEnableQuickMangaFromSearchParams` (`src/lib/workspace/quick-manga-entry.ts`).

## 2.2 Runtime/API continuity currently in use
- Workspace luôn tạo project với mode kỹ thuật `novel-promotion` (`src/lib/workspace/project-mode.ts`).
- Quick Manga API lane hiện hữu:
  - `/api/novel-promotion/[projectId]/quick-manga`
  - `/api/novel-promotion/[projectId]/quick-manga/history`
- Discoverability analytics hiện có (`src/lib/workspace/manga-discovery-analytics.ts`):
  - `workspace_manga_cta_view`
  - `workspace_manga_cta_click`
  - `workspace_project_mode_selected`
  - `workspace_project_created`
- Conversion event được emit ở create API khi `projectMode=manga`:
  - `workspace_manga_conversion` (`src/app/api/projects/route.ts`).

## 3) Pain points discoverability (as-is)

1. **Intent model chưa tách rõ ở top-level IA**
   - User-facing intent là “story vs manga”, nhưng technical mode vẫn là `novel-promotion`.
   - Dễ tạo cảm giác “Manga chỉ là preset trong mode chung”, chưa phải journey riêng từ góc nhìn người dùng.

2. **Entry semantics phân tán qua card + modal + query flag**
   - Card chọn manga, modal chọn project type, rồi lại encode intent bằng query `quickManga=1`.
   - Discovery path nhiều điểm chạm kỹ thuật, khó giải thích mental model cho user mới.

3. **Deep-link dependency vào query flag kỹ thuật**
   - `quickManga=1` là bridge hữu dụng nhưng mang tính implementation detail.
   - Nếu không có lớp semantic IA rõ ở UI shell, discoverability phụ thuộc vào cách vào route hơn là mục tiêu user.

4. **Telemetry discovery đã có nhưng taxonomy chưa phản ánh full IA step**
   - Có CTA/click/create/conversion baseline, nhưng chưa có taxonomy rõ cho các bước “chọn hành trình” ở IA use-case-first.

5. **Nomenclature mixed giữa business term và technical term**
   - UI dùng “Manga”, nhưng code/runtime giữ `novel-promotion` ở diện rộng.
   - Về discoverability: người dùng nhìn theo use-case; hệ thống hiện biểu đạt theo technical lane.

## 4) Constraint map cần giữ nguyên ở phase mapping

- Không đổi contract API quick manga hiện có.
- Không bỏ query compatibility `quickManga=1`.
- Không thay đổi runtime mode/storage contract trong pass VAT-103.
- Mọi đề xuất IA mới để backlog cho phase build sau VAT-102.

## 5) Output của VAT-103 (this sub-task)

- Hoàn tất bản đồ IA hiện trạng + pain points discoverability dựa trên code as-is.
- Không chạm code runtime, không migration behavior.
- Artifact này dùng làm input trực tiếp cho bước option/trade-off và target IA ở các sub-task tiếp theo cùng phase.
