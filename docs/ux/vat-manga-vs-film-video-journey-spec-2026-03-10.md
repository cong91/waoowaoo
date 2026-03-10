# VAT — Spec kỹ thuật/UX tách journey Manga vs Film/Video

- Ngày: 2026-03-10
- Tác giả: Scrum subagent (theo yêu cầu MrC)
- Jira context đã đọc trước khi soạn: [VAT-85](https://linktovn.atlassian.net/browse/VAT-85), [VAT-102](https://linktovn.atlassian.net/browse/VAT-102), [VAT-106](https://linktovn.atlassian.net/browse/VAT-106)
- Trạng thái tài liệu: Draft for implementation planning

---

## 1) Bối cảnh

Trong VAT hiện tại, nhóm tính năng Manga đã được tăng discoverability qua các bước trước:
- Phase discovery/build từ VAT-102 và VAT-106 đã bổ sung `entryMode=story|manga`, template theo mode, và bridge `quickManga=1`.
- Runtime chính vẫn đi qua lane `novel-promotion` và API `quick-manga`.

Tuy nhiên về mặt trải nghiệm tổng thể, user intent “Manga” và intent “Film/Video” vẫn chưa được tách thành hai journey rõ ràng từ entrypoint đến execution context.

---

## 2) Vấn đề hiện tại / scope drift

### 2.1 Vấn đề hiện tại
1. **Intent UX và technical mode còn lệch nhau**:
   - User chọn `story|manga`, nhưng runtime vẫn quy về một mode kỹ thuật chung.
2. **Manga bridge dựa trên query** (`quickManga=1`) là hợp lý cho compatibility, nhưng không nên là mô hình điều hướng dài hạn.
3. **Nhận diện Film/Video journey chưa explicit** ở lớp onboarding/entry shell (đặc biệt khi đối chiếu với Manga lane).
4. **Analytics hiện tập trung Manga discovery** (`workspace_manga_cta_*`, `workspace_manga_conversion`) nhưng thiếu taxonomy đầy đủ cho so sánh 2 journey (Manga vs Film/Video).

### 2.2 Scope drift cần tránh
- Không biến pass này thành refactor runtime/worker lớn.
- Không thay đổi contract API đang chạy ổn.
- Không phá deep-link và flow cũ đã có telemetry baseline.

---

## 3) Mục tiêu

1. Tách rõ hai journey ở lớp UX + intent model:
   - **Journey A: Manga**
   - **Journey B: Film/Video**
2. Giữ continuity kỹ thuật trong giai đoạn chuyển tiếp (compatibility bridge).
3. Chuẩn hóa routing, onboarding, analytics theo tư duy journey-first.
4. Cung cấp lộ trình migration nhiều pha, có risk gate + rollback.

---

## 4) Nguyên tắc thiết kế

1. **Journey-first, implementation-safe**: tách trải nghiệm trước, đổi runtime sau (nếu cần).
2. **Compatibility by default**: route/query/API cũ vẫn hoạt động trong giai đoạn chuyển tiếp.
3. **No dark migration**: mọi thay đổi lớn đều sau feature flag + telemetry gate.
4. **Single intent source**: một nguồn truth cho user intent, không encode rải rác.
5. **Comparative observability**: đo được song song Manga vs Film/Video cùng một funnel frame.

---

## 5) Current state (as-is)

### 5.1 Entry & intent
- `WorkspaceProjectEntryMode = 'story' | 'manga'` tại `src/lib/workspace/project-mode.ts`.
- Tạo project vẫn dùng mode kỹ thuật `novel-promotion`, optional `projectMode` để bridge.

### 5.2 Routing/bridge
- Manga entry URL: `/workspace/:id?stage=script&quickManga=1` (bridge compatibility).
- Parser bridge: `src/lib/workspace/quick-manga-entry.ts`.

### 5.3 Analytics baseline
- Event hiện có (Manga-focused):
  - `workspace_manga_cta_view`
  - `workspace_manga_cta_click`
  - `workspace_manga_conversion`
- Tracking helper: `src/lib/workspace/manga-discovery-analytics.ts`.

### 5.4 Onboarding/template
- Mode-based starter templates đã có tại `src/lib/workspace/onboarding-templates.ts`.
- VAT-106 đã mở lane onboarding theo mode nhưng chưa tách đầy đủ ở mức journey shell cho Film/Video.

---

## 6) Target state (to-be)

### 6.1 Journey taxonomy (user-facing)

Tại workspace/onboarding, user thấy rõ 2 lane:
- **Manga Journey**: tạo manga từ story/script với preset, layout, style lock, continuity controls.
- **Film/Video Journey**: viết kịch bản/phân cảnh cho video/film ad/short/long-form.

### 6.2 Intent contract (internal)

Đề xuất intent model chuẩn hóa:
- `journeyType`: `manga | film_video`
- `entryIntent` (chi tiết):
  - manga: `manga_quickstart | manga_story_to_panels`
  - film_video: `film_story_studio | video_ad_short | cinematic_scene`

Giai đoạn đầu có thể map về contract cũ:
- `journeyType=manga` -> `projectMode=manga` (+ giữ bridge `quickManga=1` khi cần)
- `journeyType=film_video` -> `projectMode=story` (hoặc alias tương thích)

---

## 7) Đề xuất tách journey Manga vs Film/Video

## 7.1 Ở lớp UX
1. Workspace hero đổi thành **Choose your creative journey**.
2. Hai primary cards ngang hàng:
   - Manga
   - Film/Video
3. Mỗi card có:
   - mục tiêu đầu ra,
   - thời gian bắt đầu ước tính,
   - nút “Start with template”.

## 7.2 Ở lớp create/onboarding
1. Bước 1: chọn journey (`manga` / `film_video`).
2. Bước 2: chọn template phù hợp journey.
3. Bước 3: xác nhận create + vào workspace theo lane context.

## 7.3 Ở lớp runtime
- Không ép tách runtime ngay.
- Dùng adapter chuyển intent mới -> contract cũ để giảm regression.

---

## 8) Routing / intent model / onboarding / analytics / compatibility bridge

### 8.1 Routing
- Giữ route chính: `/workspace`, `/workspace/:projectId`.
- Thêm semantic query tùy chọn (forward-compatible):
  - `journey=manga|film_video`
- Bridge cũ vẫn chấp nhận:
  - `quickManga=1`

### 8.2 Intent model
- FE gửi `journeyType` + `entryIntent`.
- BE/API layer tạm adapter về `projectMode` hiện hành.
- Log cả 2 lớp field (new + legacy) trong thời gian migration.

### 8.3 Onboarding
- Template gallery tách namespace theo journey:
  - `starterTemplates.manga.*`
  - `starterTemplates.filmVideo.*` (đề xuất mới)
- Copy tone theo output goal, tránh dùng “story” generic cho mọi lane.

### 8.4 Analytics
Đề xuất funnel event chuẩn hóa:
1. `workspace_journey_card_view`
2. `workspace_journey_selected`
3. `workspace_template_selected`
4. `workspace_project_create_submitted`
5. `workspace_project_created`
6. `workspace_first_generation_started`
7. `workspace_first_generation_succeeded|failed`

Bắt buộc dimension:
- `journeyType`, `entryIntent`, `templateId`, `locale`, `projectId`.

### 8.5 Compatibility bridge
- Bridge layer giữ:
  - parser `quickManga=1`
  - API quick-manga/history contract không đổi
- Thêm mapper 2 chiều trong transition:
  - new intent -> legacy fields
  - legacy deep-link -> new journey context

---

## 9) Migration phases

## Phase M0 — Spec freeze & instrumentation plan
- Chốt contract field mới (`journeyType`, `entryIntent`).
- Chốt event taxonomy + dashboard mapping cũ/mới.

## Phase M1 — UX shell split (feature-flag)
- Tách rõ 2 cards/journey trong workspace.
- Không đổi runtime APIs.

## Phase M2 — Intent adapter rollout
- FE gửi field mới.
- API adapter map về contract cũ.
- Regression tests cho deep-link cũ (`quickManga=1`).

## Phase M3 — Analytics comparability gate
- Xác nhận funnel 2 lane có dữ liệu đủ và nhất quán.
- Chưa deprecate event cũ.

## Phase M4 — Optional runtime decouple (nếu KPI đạt)
- Chỉ xem xét sau khi ổn định behavior + KPI qua >=2 release cycles.

---

## 10) Risk / rollback

### 10.1 Rủi ro
1. Drift giữa UI intent mới và runtime cũ.
2. Mất continuity analytics khi rename event quá sớm.
3. User cũ bị nhiễu khi thấy lane mới nhưng bookmark cũ vẫn vào flow legacy.

### 10.2 Rollback
- Tắt feature flag journey shell mới.
- Trả UI về shell hiện tại.
- Giữ nguyên API/query cũ (không rollback DB/migration phức tạp).
- Postmortem bắt buộc nếu conversion giảm vượt ngưỡng cảnh báo.

---

## 11) Acceptance criteria

1. User mới nhìn thấy rõ 2 lane Manga vs Film/Video tại workspace trong <=1 màn hình.
2. Create flow có bước chọn journey trước template.
3. Legacy deep-link `quickManga=1` vẫn chạy đúng.
4. Không regression API quick-manga/history.
5. Analytics có funnel so sánh được cho cả 2 journey.
6. Có feature flag + runbook rollback.
7. Có test coverage cho mapper intent + bridge compatibility.

---

## 12) Out of scope

1. Refactor toàn bộ runtime engine thành mode tách hoàn toàn trong pass đầu.
2. Đổi contract worker/orchestrator cấp thấp.
3. Thay đổi infra/deploy production.
4. Rebrand toàn bộ wording hệ thống ngoài scope journey entry/onboarding.

---

## 13) Gợi ý implementation backlog (tham chiếu)

1. Tạo `journey-intent.ts` (type + mapper + guards).
2. Mở rộng `workspace/page.tsx` cho dual-journey shell.
3. Bổ sung taxonomy analytics mới + compatibility logger.
4. Viết integration tests cho route/query legacy + new intent.
5. Viết rollout checklist + KPI gate cho deprecation.
