# VAT — ANALYSIS-ONLY chuyên sâu UX/flow Manga/Webtoon (2026-03-11)

- Scope: **analysis-only**, không sửa code runtime, không deploy.
- Repo: `/Users/mrcagents/.openclaw/workspace/projects/VAT`
- Nguồn đã đọc:
  - UX docs: `docs/ux/vat-dual-journey-separation-final-analysis-2026-03-10.md`, `docs/ux/vat-manga-vs-film-video-journey-spec-2026-03-10.md`
  - Testing/governance artifacts liên quan VAT-60/85/110 line: `docs/testing/vat-60-vat-80-manga-webtoon-capability-analysis-2026-03-10.md`, `vat-60-vat-85-keep-rollback-rewrite-matrix-2026-03-10.md`, `vat-114/115/116/117/118/119/120*.md`
  - Code truth: `workspace/page.tsx`, `project-mode.ts`, `journey-runtime-adapter.ts`, `onboarding-context.ts`, `/api/projects/route.ts`, `/api/projects/[projectId]/data/route.ts`, workspace project detail + `modes/novel-promotion/*`.

> Ghi chú: trong repo hiện không thấy artifact markdown riêng cho VAT-59; context VAT-59 được kế thừa qua các tài liệu phân tích/tổng hợp đã commit (đặc biệt docs UX/testing nêu trên).

---

## 1) Current-state UX diagnosis

### 1.1 Entry/Create đã “dual-journey shell”, nhưng runtime experience chưa dual-journey thật
- `src/app/[locale]/workspace/page.tsx` đã có 2 card:
  - Film/Video (`journeyCardFilmLabel`)
  - Manga/Webtoon (`journeyCardMangaLabel`)
- Create modal đã là wizard 3 bước (Journey → Template → Source), có telemetry neutral (`workspace_journey_*`, `workspace_wizard_step_*`).

**Nhưng** sau create, cả 2 lane đều đổ về cùng technical mode:
- payload create luôn `mode: 'novel-promotion'` (`src/lib/workspace/project-mode.ts` + `/api/projects/route.ts`)
- project detail luôn render `NovelPromotionWorkspace` (`src/app/[locale]/workspace/[projectId]/page.tsx`)
- workspace mode chỉ có `modes/novel-promotion/*` (không có runtime lane riêng cho film/video hay manga/webtoon).

### 1.2 Manga hiện là capability overlay trong editor chung
- Manga entry hiện vẫn bridge qua `?stage=script&quickManga=1` (`buildProjectEntryUrl` trong `project-mode.ts`).
- Runtime bật manga bằng parser query:
  - `shouldEnableQuickMangaFromSearchParams()` (`quick-manga-entry.ts`) chỉ check `quickManga === '1'`.
- Trong UI stage config (`NovelInputStage.tsx`), Manga được diễn đạt như toggle beta trong flow hiện tại:
  - `"Enable manga-focused presets inside the current editor flow without switching to a separate mode"`.

=> Đây là bằng chứng trực tiếp rằng Manga/Webtoon đang được “nhúng” vào video-first pipeline, chưa phải journey sản phẩm độc lập end-to-end.

---

## 2) Vì sao current flow vẫn sai (video-first bleed)

## 2.1 SoT semantics đã có, nhưng không được tiêu thụ ở project detail/runtime
- Dữ liệu `journeyType`, `entryIntent`, `sourceType` đã được lưu vào `capabilityOverrides.__workspaceOnboardingContext`:
  - tạo ở `onboarding-context.ts`
  - ghi trong `/api/projects/route.ts`
  - đọc lại trong `/api/projects/[projectId]/data/route.ts`
- Tuy nhiên project detail/runtime không dùng `onboardingContext` để render lane UI khác nhau.

**Hệ quả:** user đã chọn Manga/Webtoon nhưng khi vào workspace vẫn thấy một editor chung “novel-promotion-first”.

## 2.2 Entry intent đang tách, nhưng execution mental model vẫn hội tụ về 1 workflow
- Manga lane vào script stage bằng quick bridge.
- Film/Video lane cũng vào cùng shell/stage set (`config/script/storyboard/videos/voice`).
- Không có “Manga workspace identity” bền vững ở header, IA, stage framing, output goals.

## 2.3 Copy và IA còn để lộ implementation framing
- `projectTypeMangaTitle = "Manga Quick Start"`, `Desc = "Jump to Script stage with Quick Manga enabled"` (messages/workspace.json)
- Điều này nói với user rằng Manga là shortcut/flag của workflow cũ, không phải product lane với ngữ nghĩa riêng.

---

## 3) Phương án UI/UX tách biệt rõ cho Manga/Webtoon

## 3.1 Nguyên tắc
1. **Journey semantics là SoT** (`manga_webtoon` vs `film_video`) ở mọi surface user-facing.
2. **Compatibility bridge là implementation detail** (giữ cho continuity, không đưa vào copy/mind model).
3. **Persistent lane identity** từ entry → create → project detail/workspace.

## 3.2 UI pattern nên đổi
1. **Journey badge cố định** trong project detail/header:
   - `Manga/Webtoon Project` hoặc `Film/Video Project`.
2. **Lane-specific start panel** khi mở project lần đầu:
   - Manga: panel continuity, orientation (webtoon vertical vs manga page), style lock profile.
   - Film/Video: shot rhythm, pacing, aspect-first prompts.
3. **Lane-specific task language**:
   - tránh “quick manga”, “inside current editor flow” trong public copy.
4. **Lane-specific defaults hiển thị rõ**:
   - Manga/Webtoon: preset/layout/continuity là primary.
   - Film/Video: screenplay/video sequencing là primary.

---

## 4) Workspace differentiation proposal

## 4.1 Hiện trạng cần giữ
- Giữ route hiện tại `/workspace`, `/workspace/:projectId`.
- Giữ legacy quick bridge và quick-manga APIs để tránh regression.

## 4.2 Đề xuất tách ở workspace shell (không cần fork runtime ngay)
1. **Workspace landing**:
   - vẫn 2 primary cards, nhưng copy theo output outcomes (không nói technical bridge).
2. **Project cards list**:
   - thêm chip `Journey: Manga/Webtoon` hoặc `Journey: Film/Video` dựa trên onboardingContext.
3. **Open project behavior**:
   - đọc onboardingContext, set workspace shell mode trước khi mount stage content.

---

## 5) Create flow proposal

## 5.1 Flow mục tiêu
- Step 1: chọn journey (đã có)
- Step 2: chọn template theo journey (đã có)
- Step 3: source context + readiness (đã có)
- **Step 4 mới (lightweight): confirm lane identity**
  - "Bạn đang tạo Manga/Webtoon project"
  - tóm tắt output expectation

## 5.2 Điều chỉnh quan trọng
1. Đổi wording khỏi technical detail:
   - từ `Manga Quick Start` -> `Manga/Webtoon Studio` (hoặc tương đương).
2. Không expose `quickManga=1` ở copy.
3. Tăng tính chuyên nghiệp cho Manga lane bằng lựa chọn domain-level:
   - reading orientation,
   - continuity strictness,
   - panel density profile.

---

## 6) Project detail/workspace proposal

## 6.1 Vấn đề hiện tại
- `ProjectDetailPage` luôn render `NovelPromotionWorkspace` bất kể journey.
- Stage và components hiện là shared hoàn toàn, không có lane adapter ở UI layer.

## 6.2 Đề xuất kiến trúc UI (incremental)
1. **Journey-aware workspace shell** (mỏng):
   - `WorkspaceShell({journeyType})` bọc quanh runtime hiện tại.
2. **Journey-aware stage emphasis**:
   - Manga/Webtoon mặc định focus config/script với control cards chuyên biệt.
   - Film/Video giữ nhịp hiện tại.
3. **Journey-aware helper panels**:
   - Manga: continuity/history/regenerate block đặt prominent.
   - Film/Video: shot/video production block prominent.

> Mục tiêu: user cảm thấy là 2 sản phẩm khác nhau dù backend runtime core còn shared.

---

## 7) Reuse được gì từ video flow, không reuse được gì

## 7.1 Reuse tốt (nên giữ)
- Task/run infra, stream infra, auth/guard, retry/error handling.
- Story-to-script / script-to-storyboard orchestration core.
- Existing quick-manga contract/history/regenerate API để continuity.

## 7.2 Không nên reuse trực diện ở lớp sản phẩm
- Framing `mode='novel-promotion'` như identity user-facing.
- Query `quickManga=1` làm semantic trigger chính.
- Copy định vị Manga là "beta toggle / shortcut".
- Single stage narrative chung cho mọi journey mà không có lane identity.

---

## 8) Đề xuất execution order (để sửa đúng, ít rủi ro)

## Phase 0 — Governance/SoT lock
- Khóa quy ước: VAT-110 line là SoT, VAT-60/85 là execution history.

## Phase 1 — UX wording + identity pass (low risk)
- Đổi copy lane labels/descriptions theo product semantics.
- Thêm journey chip/badge trên project cards + project header.

## Phase 2 — Journey-aware shell wiring
- Read `onboardingContext` tại project detail và truyền xuống workspace shell.
- Chưa đổi runtime API/worker; chỉ đổi presentation/IA emphasis.

## Phase 3 — Create→Workspace semantic continuity
- Bổ sung confirmation + lane-specific defaults presentation.
- Telemetry neutral taxonomy làm primary; legacy events giữ dual-write.

## Phase 4 — Capability prominence rebalance
- Manga controls/history thành “first-class panel” cho lane Manga/Webtoon.
- Film/Video panel set tối ưu riêng.

## Phase 5 — Optional deeper decouple (chỉ nếu KPI đạt)
- Chỉ cân nhắc khi telemetry/UAT ổn định >= 2 release cycles.

---

## Kết luận ngắn

VAT hiện đã có nền tảng kỹ thuật tốt để chạy Manga/Webtoon, nhưng UX còn mắc lỗi **video-first bleed** vì journey semantics chưa được xuyên suốt đến project detail/runtime presentation. Cách sửa đúng là:
1) tách **identity + IA + copy + presentation** trước,
2) giữ compatibility bridge/backend runtime ổn định,
3) chỉ tách runtime sâu khi số liệu chứng minh cần thiết.
