# VAT-119 — [Manga/Webtoon] Contract checklist cho compatibility adapter (không phá quickManga/history)

- Ticket: https://linktovn.atlassian.net/browse/VAT-119
- Parent story: https://linktovn.atlassian.net/browse/VAT-114
- Date: 2026-03-10
- Strategy: `code_light` (contract-first, không đổi runtime/API behavior)
- Scope: checklist contract để adapter implementation bám đúng backward-compatibility guardrails.

---

## 1) Jira context read-first (đã đọc trước khi thực hiện)

- Issue key: `VAT-119`
- Summary: `[Manga/Webtoon] Contract checklist cho compatibility adapter (không phá quickManga/history)`
- Type: `Subtask`
- Parent: `VAT-114`
- Start status: `To Do`
- Labels: `dual-journey`, `manga-webtoon`, `vat-110-reset`

Issue description (tóm tắt):
- Checklist adapter để bảo toàn backward compatibility trong rollout.

---

## 2) Scope guard (strict VAT-119)

Pass VAT-119 này chỉ cung cấp **contract checklist + verification map** cho compatibility adapter.

Không làm trong pass này:
- Không đổi runtime logic quick-manga route/history.
- Không đổi response schema của `/api/novel-promotion/[projectId]/quick-manga` và `/quick-manga/history`.
- Không đổi UX flow đang chạy.
- Không deploy.

---

## 3) Compatibility adapter contract checklist

## 3.1 Adapter input contract (semantic -> legacy bridge)

- [ ] Adapter nhận semantic fields tối thiểu: `journeyType`, `entryIntent`.
- [ ] Chỉ map sang legacy bridge khi `journeyType === "manga_webtoon"`.
- [ ] Không được suy luận ngược semantic intent chỉ từ `quickManga=1`.
- [ ] Adapter phải giữ idempotent mapping: cùng input semantic -> cùng legacy payload.

## 3.2 Legacy continuity invariants (không phá quickManga)

- [ ] Deep-link cũ `?stage=script&quickManga=1` vẫn bật đúng Manga context.
- [ ] `src/lib/workspace/quick-manga-entry.ts` behavior giữ nguyên (`quickManga === '1'`).
- [ ] `buildProjectEntryUrl(..., 'manga')` vẫn trả `?stage=script&quickManga=1`.
- [ ] Không xóa/đổi tên legacy runtime fields `quickManga`, `quickMangaControls`, `quickMangaStage` trong payload đường quick-manga.

## 3.3 API contract invariants (không phá history)

- [ ] `POST /api/novel-promotion/[projectId]/quick-manga` giữ shape payload hiện tại cho continuity/regenerate.
- [ ] `GET /api/novel-promotion/[projectId]/quick-manga/history` giữ response envelope `history`.
- [ ] Các metadata continuity trong history (`statusBucket`, `latestEventType`, `continuityConflictHint`, `controls`, `continuity`) không bị rename/breaking.
- [ ] Shortcut `history-regenerate` vẫn hợp lệ end-to-end.

## 3.4 Non-breaking rollout guardrails

- [ ] Adapter thêm semantic layer theo kiểu additive, không breaking existing callers.
- [ ] Nếu thiếu semantic field mới, legacy flow hiện tại vẫn chạy như baseline (không đổi outcome).
- [ ] Mọi thay đổi adapter phải có regression tests cho quick-manga route/history/deep-link.
- [ ] Không gộp task runtime decouple sâu vào pass adapter này.

---

## 4) Verification map (repo evidence hiện có)

### 4.1 Deep-link / entry compatibility
- `tests/unit/helpers/workspace-project-mode.test.ts`
  - `buildProjectEntryUrl('project-123', 'manga') -> /workspace/project-123?stage=script&quickManga=1`
  - `shouldEnableQuickMangaFromSearchParams(new URLSearchParams('quickManga=1')) === true`

### 4.2 Quick-manga API contract
- `tests/integration/api/contract/quick-manga-route.test.ts`
- `tests/integration/api/contract/quick-manga-history-route.test.ts`

### 4.3 Quick-manga payload/continuity helpers
- `tests/unit/helpers/quick-manga-contract.test.ts`
- `tests/unit/helpers/quick-manga-history.test.ts`
- `tests/unit/helpers/quick-manga-regenerate.test.ts`
- `tests/unit/helpers/quick-manga-editor-flow.test.ts`

---

## 5) Adapter AC gate (ready for implementers)

Adapter implementation chỉ được coi là pass khi:

1. Không có breaking diff ở 2 API contracts quick-manga/history.
2. Deep-link `quickManga=1` vẫn pass regression.
3. Regenerate flow từ history (`history-regenerate`) vẫn pass.
4. Semantic fields mới tồn tại ở adapter/log layer nhưng không làm đổi baseline behavior của flow cũ.

---

## 6) Handover note

VAT-119 artifact này là checklist contract bắt buộc trước khi code compatibility adapter trong chain VAT-114.

Thứ tự khuyến nghị cho pass implementation kế tiếp:
1. thêm adapter mapping tests trước,
2. wiring adapter vào entry/create pipeline,
3. chạy full regression quick-manga/history,
4. chỉ merge khi toàn bộ invariants ở mục 3 còn đúng.
