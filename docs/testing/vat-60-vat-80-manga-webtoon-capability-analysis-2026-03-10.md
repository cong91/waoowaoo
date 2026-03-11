# VAT-60 + VAT-80 — Phân tích tách capability Manga/Webtoon thành journey sản phẩm riêng

- Date: 2026-03-10
- Lane: **ANALYSIS ONLY** (không sửa runtime, không deploy)
- Scope: điều tra codebase thật + đối chiếu intent VAT-60/VAT-80

---

## 1) Jira/context đã đọc trước khi phân tích

### 1.1 Jira links (đã truy cập)
- VAT-60: https://linktovn.atlassian.net/browse/VAT-60
- VAT-80: https://linktovn.atlassian.net/browse/VAT-80

> Ghi chú: môi trường hiện tại không đọc được nội dung chi tiết Jira do auth/session web fetch; vì vậy intent của VAT-60/VAT-80 được đối chiếu thêm từ artefacts nội bộ đã commit trong repo.

### 1.2 Artefacts nội bộ liên quan đã đọc
- `docs/testing/vat-60-closure-readiness-2026-03-09.md`
- `docs/testing/vat-83-phase3-go-no-go-framework-2026-03-09.md`
- `docs/testing/vat-84-phase3-adoption-churn-metrics-2026-03-09.md`
- `docs/testing/vat-60-vat-85-keep-rollback-rewrite-matrix-2026-03-10.md`
- `docs/ux/vat-manga-vs-film-video-journey-spec-2026-03-10.md`
- `docs/testing/vat-103-ia-mapping-2026-03-10.md`

### 1.3 Evidence commit trực tiếp cho VAT-80 trong git log
- `c12ed2e feat(vat-80): style-lock + chapter continuity controls and metadata`
- `8674f6e fix(vat-72): resolve quick manga regenerate type mismatch + continuity guard`

---

## 2) Current-state architecture map (Manga/Webtoon trong VAT hiện tại)

## 2.1 Entry & create flow (workspace)

### Files chính
- `src/app/[locale]/workspace/page.tsx`
- `src/lib/workspace/project-mode.ts`
- `src/lib/workspace/onboarding-templates.ts`
- `src/lib/workspace/quick-manga-entry.ts`
- `src/app/api/projects/route.ts`

### Luồng thực tế
1. User ở `/workspace` chọn card `Story` hoặc `Manga`.
2. Create modal giữ `entryMode: 'story' | 'manga'`.
3. API create vẫn tạo `project.mode = 'novel-promotion'` (single technical mode), chỉ thêm optional `projectMode` để semantic bridge.
4. Nếu `entryMode = manga`, `buildProjectEntryUrl()` route tới:
   - `/workspace/:id?stage=script&quickManga=1`
5. Editor đọc query qua `shouldEnableQuickMangaFromSearchParams()` để bật state quick manga.

**Kết luận kiến trúc hiện trạng:**
- Ở UX có nhánh Manga, nhưng runtime core vẫn chung lane `novel-promotion`.
- `quickManga=1` đóng vai trò **compatibility/query bridge**.

---

## 2.2 Project mode / intent model hiện tại

### Model hiện có
- `WorkspaceProjectEntryMode = 'story' | 'manga'`
- Payload create:
  - `mode: 'novel-promotion'` (fixed)
  - `projectMode?: 'story' | 'manga'` (optional)

### Đánh giá
- Có lớp “intent nhẹ” ở create flow.
- Chưa có abstraction product-level như `journeyType = manga | film_video`.
- `story|manga` đang vừa làm UX intent vừa làm bridge runtime => dễ coupling semantics/implementation.

---

## 2.3 Quick-manga entry/query bridge

### Files
- `src/lib/workspace/quick-manga-entry.ts`
- `src/lib/workspace/quick-manga-editor-flow.ts`
- `src/lib/workspace/quick-manga-session.ts`
- `src/app/[locale]/workspace/[projectId]/modes/novel-promotion/hooks/useNovelPromotionWorkspaceController.ts`

### Cơ chế
- Parser query: chỉ bật quick manga khi `quickManga=1`.
- Session preference key: `vat.quickManga.enabled` để nhớ toggle theo session.
- Resolver ưu tiên:
  1) query entry (`quickManga=1`) 
  2) session preference
  3) state hiện tại

**Ý nghĩa:**
- Đây là bridge backward compatibility rất rõ.
- Nhưng query flag là implementation detail, không nên là semantic contract dài hạn cho journey sản phẩm.

---

## 2.4 Quick-manga APIs / history / regenerate

### Files
- `src/app/api/novel-promotion/[projectId]/quick-manga/route.ts`
- `src/app/api/novel-promotion/[projectId]/quick-manga/history/route.ts`
- `src/lib/novel-promotion/quick-manga-contract.ts`
- `src/lib/novel-promotion/quick-manga-history.ts`
- `src/lib/novel-promotion/quick-manga-regenerate.ts`
- `src/lib/query/hooks/useQuickMangaHistory.ts`

### API façade `quick-manga`
- Nhận `stage = story-to-script | script-to-storyboard`
- Parse contract mạnh (preset/layout/color/style + controls + continuity)
- Map sang task type chung:
  - `story_to_script_run`
  - `script_to_storyboard_run`
- Dedupe key riêng quick manga:
  - `quick_manga:{stage}:{episodeId}:{preset}:{layout}:{colorMode}:{style|auto}`

### History API
- Tổng hợp runs của 2 workflow chung (`story_to_script_run`, `script_to_storyboard_run`)
- Lọc run theo quick manga metadata (`quickManga.enabled`)
- Bổ sung lifecycle metadata + conflict hint continuity (`balanced/style-lock-priority/chapter-context-priority`)

### Regenerate continuity
- Hỗ trợ shortcut `history-regenerate` với `sourceRunId`
- Validate source run thuộc user/project
- Reuse options + controls + fallback content

**Kết luận:**
- API contract quick manga đã mature theo hướng façade/overlay trên pipeline chung.
- Đây là tài sản tái sử dụng quan trọng cho future Manga/Webtoon journey.

---

## 2.5 Orchestration story-to-script / script-to-storyboard liên quan Manga

### Files
- `src/lib/workers/handlers/story-to-script.ts`
- `src/lib/workers/handlers/script-to-storyboard.ts`
- `src/lib/novel-promotion/quick-manga.ts`
- `src/lib/novel-promotion/script-to-storyboard/orchestrator.ts`
- `src/app/api/novel-promotion/[projectId]/story-to-script-stream/route.ts`
- `src/app/api/novel-promotion/[projectId]/script-to-storyboard-stream/route.ts`

### Quan sát thực tế
- Worker `story-to-script` chạy pipeline chung, không tách mode manga riêng ở worker level.
- Worker `script-to-storyboard` có nhánh quick manga:
  - đọc options từ payload
  - inject directive vào prompt clip qua `buildQuickMangaStoryboardInput()`
- `quick-manga.ts` cung cấp directive layer:
  - preset
  - layout intelligence
  - color mode
  - style
  - continuity-oriented guidelines

**Kết luận:**
- Manga/Webtoon hiện là **prompt-orchestration specialization** trên shared pipelines, chưa phải runtime lane tách biệt.

---

## 2.6 Analytics / telemetry liên quan Manga

### Files
- `src/lib/workspace/manga-discovery-analytics.ts`
- `src/app/api/projects/route.ts` (event conversion)
- `scripts/quick-manga-phase-metrics.ts`
- `scripts/quick-manga-telemetry-baseline.ts`

### Taxonomy hiện có
- Workspace discovery:
  - `workspace_manga_cta_view`
  - `workspace_manga_cta_click`
  - `workspace_project_mode_selected`
  - `workspace_project_created`
- API conversion event:
  - `workspace_manga_conversion` khi `projectMode=manga`
- Ops/phase metrics:
  - dựa trên `dedupeKey` prefix `quick_manga:`

### Hạn chế
- Event hiện manga-centric, chưa cân bằng cho so sánh dual journey (Manga vs Film/Video).
- Adoption sample lịch sử còn thấp (theo VAT-84 artifacts: insufficient sample tại thời điểm đó).

---

## 3) VAT-60 / VAT-80 intent recap (từ evidence code + artefacts)

## 3.1 VAT-60 (epic direction)
Từ closure/go-no-go docs:
- Giữ continuity: chưa tách mode sớm.
- Quyết định tách mode phải qua gate adoption/reliability/migration safety.
- Framework ưu tiên **No-Go tạm thời khi thiếu sample**, không tách kiến trúc vì cảm tính.

=> Intent VAT-60 là: **xây baseline vững + đo đủ dữ liệu rồi mới tách lớn**.

## 3.2 VAT-80 (feature tranche trong VAT-60)
Từ commit evidence + code hiện trạng:
- VAT-80 đã đẩy nhanh năng lực Manga qua:
  - style lock
  - chapter continuity
  - history/regenerate continuity metadata
- Cách làm là additive trên pipeline hiện hữu (không fork runtime lane).

=> Intent VAT-80 là: **nâng chiều sâu quality/control cho Manga trong lane hiện tại**, đồng thời giữ compatibility.

---

## 4) Reusable parts từ flow video/film hiện tại

## 4.1 Nên reuse mạnh
1. **Task/run infrastructure chung**
   - `maybeSubmitLLMTask`, run lifecycle, stream hooks, dedupe patterns.
2. **Story-to-script và script-to-storyboard workers**
   - core orchestration, retry, parse/validation pipeline.
3. **Project/episode data model hiện hữu**
   - project + novelPromotionProject + episode/clips/storyboard assets.
4. **Workspace shell + stage runtime**
   - stage control, query/state, mutations/query hooks.
5. **History + lifecycle plumbing**
   - listRuns + task snapshots + timeline events.
6. **Analytics ingestion & scripts**
   - không bỏ hệ hiện tại; mở rộng additive taxonomy.

## 4.2 Reuse có điều kiện (cần adapter)
1. `projectMode story|manga` -> giữ tương thích, nhưng bổ sung lớp `journeyType`.
2. `quickManga=1` query bridge -> giữ cho deep-link cũ, nhưng không dùng làm SoT semantic mới.
3. Event `workspace_manga_*` -> dual-write khi mở taxonomy mới.

---

## 5) Non-reusable / harmful coupling parts

1. **Coupling giữa product intent và technical mode**
   - user chọn manga nhưng DB mode vẫn `novel-promotion` fixed.
2. **Query-flag driven semantics**
   - `quickManga=1` đang encode intent ở URL theo kiểu kỹ thuật.
3. **Analytics thiên một phía**
   - khó trả lời câu hỏi sản phẩm “Manga vs Film/Video journey hiệu quả ra sao”.
4. **Naming/namespace debt**
   - `quick-manga` trong namespace `novel-promotion` gây mơ hồ khi scale thành capability riêng.

---

## 6) Đề xuất target architecture cho Manga/Webtoon riêng (product-capability first)

## 6.1 Kiến trúc logic đề xuất

### Lớp 1: Product intent (mới)
- `journeyType: 'manga_webtoon' | 'film_video'`
- `entryIntent` chi tiết theo journey

### Lớp 2: Compatibility adapter (trung gian)
- map `journeyType -> projectMode + query bridge`
- trong phase chuyển tiếp:
  - manga_webtoon -> `projectMode='manga'` + (optional) `quickManga=1`
  - film_video -> `projectMode='story'`

### Lớp 3: Runtime execution (giữ ổn định giai đoạn đầu)
- vẫn dùng worker/pipeline chung hiện tại
- manga/webtoon differentiation tiếp tục qua contract + directives + controls

## 6.2 API shape đề xuất (additive, không phá contract cũ)
- Keep:
  - `/api/novel-promotion/[projectId]/quick-manga`
  - `/api/novel-promotion/[projectId]/quick-manga/history`
- Add semantic wrapper (optional phase sau):
  - `/api/manga-webtoon/[projectId]/generate` (alias adapter)
  - `/api/manga-webtoon/[projectId]/history` (alias adapter)
- Dual-read/dual-write trong transition window.

## 6.3 UX shell đề xuất
- Workspace top-level chọn journey trước (Manga/Webtoon vs Film/Video).
- Create modal theo journey (template/preset copy chuyên biệt).
- Không expose `quickManga` ở user mental model.

---

## 7) Migration strategy theo phase

## Phase A — Semantic model (no runtime break)
- Thêm type `journeyType` + mapper.
- Không đổi worker/API contract.
- Add tests mapping old/new.

## Phase B — Journey-first UX shell
- Refactor workspace/create flow theo journey trước.
- Giữ route cũ và `quickManga=1` compatibility.

## Phase C — Analytics dual taxonomy
- Giữ event cũ `workspace_manga_*`.
- Add event mới có dimension:
  - `journeyType`, `entryIntent`, `templateId`, `projectId`, `locale`.
- Dashboard mapping old/new.

## Phase D — API alias capability (optional)
- Thêm façade API semantic `manga-webtoon/*` map về runtime cũ.
- Không deprecate quick-manga ngay.

## Phase E — De-coupling decision gate
- Chỉ cân nhắc tách runtime lane khi pass gate VAT-60 style:
  - adoption đủ sample
  - reliability ổn định
  - rollback < 30m

---

## 8) Risk / rollback / dependency map

## 8.1 Risk chính
1. **Semantic drift**: UI nói journey mới nhưng backend/log vẫn legacy.
2. **Telemetry discontinuity**: đổi event gấp làm gãy chuỗi so sánh lịch sử.
3. **Deep-link regression**: làm hỏng `quickManga=1` và history/regenerate continuity.
4. **Over-separation too early**: tách runtime lane sớm khi adoption chưa đủ.

## 8.2 Rollback chiến lược
- Feature-flag ở lớp journey UX + taxonomy mới.
- Khi lỗi: rollback về shell hiện tại + giữ API cũ nguyên trạng.
- Không rollback DB destructive.
- RTO mục tiêu: <= 30 phút (theo framework VAT-83).

## 8.3 Dependency map
- Product: định nghĩa canonical journey taxonomy.
- Data/Analytics: dashboard dual taxonomy + mapping old/new.
- FE: workspace/create shell + mapper.
- BE: adapter payload/API semantic alias.
- QA: regression matrix quick-manga route/history/deep-link.

---

## 9) Kết luận phân tích

1. VAT hiện tại đã có nền Manga mạnh ở mức **capability layer** (controls/history/regenerate/contract), nhưng chưa tách thành **journey architecture** hoàn chỉnh.
2. Hướng đúng không phải “fork runtime ngay”, mà là “tách semantic/product layer trước, runtime giữ ổn định”.
3. Các tài sản cần giữ: quick-manga APIs, query bridge, orchestration chung, telemetry baseline scripts.
4. Điểm cần rewrite: intent model, journey-first IA shell, analytics taxonomy đối xứng.
5. Đề xuất chính: triển khai migration theo phase additive, giữ compatibility tuyệt đối ở các contract hiện đang chạy.

---

## 10) Recommendation bước tiếp theo (analysis only, không implementation)

1. Tạo 1 ADR ngắn “JourneyType vs ProjectMode” làm SoT kỹ thuật cho toàn team.
2. Chốt taxonomy analytics dual-journey trước khi sửa UI lớn.
3. Dựng test matrix bắt buộc cho compatibility:
   - `quickManga=1`
   - `/quick-manga`
   - `/quick-manga/history`
   - history-regenerate continuity.
4. Đưa roadmap Phase A/B/C vào planning ticket chain (VAT-60 follow-up) thay vì tách runtime lane ngay.
5. Chỉ mở phase API alias/runtime-decouple khi dữ liệu adoption đạt gate.

---

## 11) Inventory files đã rà soát trực tiếp (code truth)

### Workspace/create/intent
- `src/app/[locale]/workspace/page.tsx`
- `src/lib/workspace/project-mode.ts`
- `src/lib/workspace/onboarding-templates.ts`
- `src/lib/workspace/quick-manga-entry.ts`
- `src/lib/workspace/quick-manga-editor-flow.ts`
- `src/lib/workspace/quick-manga-session.ts`
- `src/app/api/projects/route.ts`

### Quick-manga API/history/regenerate
- `src/app/api/novel-promotion/[projectId]/quick-manga/route.ts`
- `src/app/api/novel-promotion/[projectId]/quick-manga/history/route.ts`
- `src/lib/novel-promotion/quick-manga-contract.ts`
- `src/lib/novel-promotion/quick-manga-history.ts`
- `src/lib/novel-promotion/quick-manga-regenerate.ts`
- `src/lib/query/hooks/useQuickMangaHistory.ts`

### Orchestration/workers
- `src/lib/novel-promotion/quick-manga.ts`
- `src/lib/novel-promotion/script-to-storyboard/orchestrator.ts`
- `src/lib/workers/handlers/story-to-script.ts`
- `src/lib/workers/handlers/script-to-storyboard.ts`
- `src/app/api/novel-promotion/[projectId]/story-to-script-stream/route.ts`
- `src/app/api/novel-promotion/[projectId]/script-to-storyboard-stream/route.ts`
- `src/lib/query/hooks/useStoryToScriptRunStream.ts`
- `src/lib/query/hooks/useScriptToStoryboardRunStream.ts`

### UI stage/config/history panels
- `src/app/[locale]/workspace/[projectId]/modes/novel-promotion/hooks/useNovelPromotionWorkspaceController.ts`
- `src/app/[locale]/workspace/[projectId]/modes/novel-promotion/hooks/useWorkspaceExecution.ts`
- `src/app/[locale]/workspace/[projectId]/modes/novel-promotion/components/ConfigStage.tsx`
- `src/app/[locale]/workspace/[projectId]/modes/novel-promotion/components/NovelInputStage.tsx`
- `src/app/[locale]/workspace/[projectId]/modes/novel-promotion/components/QuickMangaHistoryPanel.tsx`

### Telemetry/scripts/tests/docs
- `src/lib/workspace/manga-discovery-analytics.ts`
- `scripts/quick-manga-phase-metrics.ts`
- `scripts/quick-manga-telemetry-baseline.ts`
- `tests/integration/api/contract/quick-manga-route.test.ts`
- `tests/integration/api/contract/quick-manga-history-route.test.ts`
- `docs/testing/vat-60-closure-readiness-2026-03-09.md`
- `docs/testing/vat-83-phase3-go-no-go-framework-2026-03-09.md`
- `docs/testing/vat-84-phase3-adoption-churn-metrics-2026-03-09.md`
- `docs/testing/vat-60-vat-85-keep-rollback-rewrite-matrix-2026-03-10.md`
- `docs/ux/vat-manga-vs-film-video-journey-spec-2026-03-10.md`
- `docs/testing/vat-103-ia-mapping-2026-03-10.md`

---

## 12) Jira update status

- Đã đọc/truy cập: VAT-60, VAT-80 (link level).
- Chưa cập nhật comment Jira trong pass này (không có tool Jira write trực tiếp trong lane hiện tại).
- Artifact analysis để attach/comment: file này.
