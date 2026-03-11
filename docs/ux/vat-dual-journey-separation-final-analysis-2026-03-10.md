# VAT — FINAL Analysis tách 2 tính năng sản phẩm: Create Video/Film vs Create Manga/Webtoon

- Ngày: 2026-03-10
- Loại: Final analysis (scope reset theo yêu cầu mới)
- Trạng thái: Analysis-only, **không sửa code production**, **không deploy production**

## 1) Jira context bắt buộc đã đọc

- VAT-59: https://linktovn.atlassian.net/browse/VAT-59
- VAT-60: https://linktovn.atlassian.net/browse/VAT-60
- VAT-85: https://linktovn.atlassian.net/browse/VAT-85

### 1.1 Ghi chú context quan trọng

1. **VAT-59** là research input hợp lệ (competitor + source-aware), dùng để định hướng.
2. **VAT-60** và **VAT-85** là execution history; có nhiều phần đã tối ưu discoverability Manga nhưng vẫn neo vào lane kỹ thuật `novel-promotion`.
3. Scope drift trước đây: audit/triển khai thiên về “đưa Manga vào flow hiện hữu” thay vì tách thành **2 tính năng sản phẩm độc lập ở tầng journey**.

---

## 2) Kết luận cốt lõi (scope mới)

### 2.1 Sản phẩm mục tiêu phải là 2 journey tách bạch

- **Journey A: Create Video/Film**
- **Journey B: Create Manga/Webtoon**

Không dùng framing cũ kiểu “Manga là biến thể trong flow Video/Film”.

### 2.2 Hiện trạng thực tế trong code

Codebase hiện đã có nhiều thành phần Manga, nhưng đa phần là:
- bridge/query compatibility (`quickManga=1`),
- façade API trong namespace `novel-promotion`,
- runtime worker vẫn đi qua pipeline chung.

=> Nghĩa là **đã có capability** nhưng **chưa có product architecture tách journey rõ ràng**.

---

## 3) Điều tra code thật theo các vùng bắt buộc

## 3.1 Workspace / create flow
- `src/app/[locale]/workspace/page.tsx`
- `src/lib/workspace/project-mode.ts`

Quan sát:
- UI có mode `story|manga` trong create modal.
- Payload tạo project vẫn dùng mode kỹ thuật `novel-promotion` + optional `projectMode`.
- Manga entry đang dùng `buildProjectEntryUrl(..., 'manga')` -> `?stage=script&quickManga=1`.

Nhận định:
- Đây là **entry split nhẹ**, chưa phải split ở mức product journey architecture.

## 3.2 Project mode / intent model
- `src/lib/workspace/project-mode.ts`

Quan sát:
- `WorkspaceProjectEntryMode = 'story' | 'manga'`.
- Contract tạo project chưa có semantic `journeyType=film_video|manga`.

Nhận định:
- Intent model hiện tại vẫn gắn chặt implementation cũ (story/manga), chưa phản ánh 2 product lines mới.

## 3.3 Quick-manga bridge
- `src/lib/workspace/quick-manga-entry.ts`
- `src/lib/workspace/quick-manga-editor-flow.ts`
- `src/lib/workspace/quick-manga-session.ts`

Quan sát:
- Bridge chính vẫn là query param `quickManga=1` + session preference.

Nhận định:
- Cần giữ để tương thích ngắn hạn, nhưng không nên là semantic source-of-truth dài hạn.

## 3.4 Quick-manga / history APIs
- `src/app/api/novel-promotion/[projectId]/quick-manga/route.ts`
- `src/app/api/novel-promotion/[projectId]/quick-manga/history/route.ts`
- `src/lib/novel-promotion/quick-manga-contract.ts`
- `src/lib/novel-promotion/quick-manga-history.ts`

Quan sát:
- API façade ổn định, có continuity/regenerate controls.
- Stage contract rõ (`story-to-script`, `script-to-storyboard`).

Nhận định:
- Đây là khối năng lực có thể reuse mạnh cho Manga/Webtoon journey.

## 3.5 Story-to-script / script-to-storyboard orchestration liên quan Manga
- `src/lib/novel-promotion/quick-manga.ts`
- `src/lib/novel-promotion/story-to-script/orchestrator.ts`
- `src/lib/novel-promotion/script-to-storyboard/orchestrator.ts`
- `src/lib/workers/handlers/story-to-script.ts`
- `src/lib/workers/handlers/script-to-storyboard.ts`
- `src/app/api/novel-promotion/[projectId]/story-to-script-stream/route.ts`
- `src/app/api/novel-promotion/[projectId]/script-to-storyboard-stream/route.ts`

Quan sát:
- Quick Manga đang inject directive vào orchestrator (preset/layout/color/style + continuity controls).
- Worker pipeline robust, có retry/error handling.

Nhận định:
- Nên reuse làm **Manga Runtime Core**. Không nên bắt Film/Video phải đi qua cùng semantics quick-manga.

## 3.6 Analytics / telemetry
- `src/lib/workspace/manga-discovery-analytics.ts`
- `src/app/api/projects/route.ts`
- `scripts/quick-manga-phase-metrics.ts`

Quan sát:
- Event taxonomy hiện manga-centric (`workspace_manga_*`).
- Có conversion event khi `projectMode=manga`.

Nhận định:
- Chưa đủ để đo so sánh 2 journey cân bằng.

## 3.7 Onboarding / templates
- `src/lib/workspace/onboarding-templates.ts`
- `src/app/[locale]/workspace/page.tsx`

Quan sát:
- Có starter templates theo mode story/manga.

Nhận định:
- Reuse được nền tảng gallery, nhưng cần tách namespace và copy cho Film/Video như journey riêng.

---

## 4) Reuse vs Non-reuse (trả lời bắt buộc)

## 4.1 Phần của Create Video/Film có thể tái sử dụng cho Create Manga/Webtoon

1. Hạ tầng task/run/stream (`maybeSubmitLLMTask`, run graph, SSE).
2. Cơ chế auth/project guard/api error contracts.
3. Workspace shell framework + stage runtime infrastructure.
4. Asset library orchestration primitives (không phải terminology).
5. Retry/observability/error normalization trong workers.

## 4.2 Phần không nên reuse trực tiếp (vì gây coupling/scope drift)

1. **Intent semantics**: không để `story` đại diện cho Film/Video + Manga cùng lúc.
2. **Entry semantic bằng query bridge** (`quickManga=1`) như source-of-truth.
3. **Analytics taxonomy thiên Manga** làm baseline chung cho cả Film/Video.
4. **Onboarding copy/template chung chung** khiến user không thấy 2 sản phẩm tách bạch.
5. **Namespace sản phẩm**: không tiếp tục framing Manga như addon của lane Video/Film.

---

## 5) Target architecture (tách rõ 2 journey)

## 5.1 Product Intent Layer (mới)
- `journeyType`: `film_video | manga_webtoon`
- `entryIntent`: chi tiết theo từng journey
- Là SoT ở UI + analytics + create API contract

## 5.2 Compatibility Adapter Layer
- Map `journeyType` -> legacy runtime fields (`projectMode`, `quickManga`) trong giai đoạn chuyển tiếp
- Đảm bảo deep-link cũ vẫn chạy

## 5.3 Runtime Capability Layer
- Giữ lane runtime hiện tại ở short-term
- Tách dần semantic ownership:
  - Manga/Webtoon runtime profile dùng quick-manga capabilities
  - Film/Video runtime profile dùng film-video templates/flows riêng

## 5.4 Analytics Layer
- Event taxonomy trung lập theo journey, ví dụ:
  - `workspace_journey_selected`
  - `workspace_template_selected`
  - `workspace_project_created`
  - `workspace_first_generation_started/succeeded/failed`
- Bắt buộc dimension: `journeyType`, `entryIntent`, `templateId`, `locale`, `projectId`

---

## 6) Migration strategy theo phase

### Phase A — Contract & taxonomy freeze
- Chốt `journeyType/entryIntent`.
- Chốt analytics dual-journey taxonomy.

### Phase B — UX split (feature flag)
- Tách rõ 2 card/journey từ workspace/create.
- Không đổi API runtime lõi.

### Phase C — Adapter rollout
- FE gửi field mới.
- BE map về legacy compatibility fields.
- Giữ `quickManga=1` parser + quick-manga APIs.

### Phase D — Telemetry gate
- Đảm bảo so sánh funnel 2 journey ổn định >= 2 release cycles.
- Chưa deprecate event cũ quá sớm.

### Phase E — Optional runtime separation
- Chỉ mở khi KPI + stability đạt ngưỡng.

---

## 7) Risk / rollback

## 7.1 Risks
1. UI intent mới lệch runtime cũ.
2. Analytics bị đứt continuity nếu rename event đột ngột.
3. Regression deep-link/history quick-manga.

## 7.2 Rollback
1. Tắt feature flag journey split UI.
2. Quay về UI shell cũ, giữ adapter và API cũ.
3. Không rollback DB/runtime lớn trong đợt đầu.

---

## 8) Kết luận điều hành

1. VAT-59 là input tham khảo đúng; VAT-60/VAT-85 cho thấy execution history có scope drift về framing.
2. Hướng đúng hiện tại: tách **2 tính năng sản phẩm** rõ ràng (Video/Film vs Manga/Webtoon).
3. Không phá continuity: giữ runtime/API bridge ngắn hạn, tách ở intent/UX/analytics trước.
4. Chỉ cân nhắc tách runtime sâu sau khi có telemetry gate pass.

---

## 9) Links tham chiếu nhanh

- VAT-59: https://linktovn.atlassian.net/browse/VAT-59
- VAT-60: https://linktovn.atlassian.net/browse/VAT-60
- VAT-85: https://linktovn.atlassian.net/browse/VAT-85
- Spec trước đó (để đối chiếu scope drift):
  - https://linktovn.atlassian.net/browse/VAT-85?focusedCommentId=13439
  - `docs/ux/vat-manga-vs-film-video-journey-spec-2026-03-10.md`
