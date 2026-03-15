# VAT-136 — Benchmark Case List (Manga/Webtoon lane)

## Mục đích
Danh sách benchmark cases ưu tiên để team FE/QA verify nhanh các điểm sống còn của VAT-131 P2 (không deploy).

---

## A. Golden-path benchmarks

### BM-01 — Workspace entry hiển thị 2 journey cards ngang hàng
- **Goal:** xác nhận dual-journey entry đúng product framing.
- **Steps:** vào `/workspace`, quan sát card Manga/Webtoon và Video/Film.
- **Expected:** cả 2 card hiển thị rõ CTA/copy riêng.
- **Linked requirements:** VAT136-RQ-001.

### BM-02 — Create Manga project qua wizard 3 bước
- **Goal:** xác nhận onboarding flow implementation-ready.
- **Steps:** chọn Manga card -> đi qua 3 bước -> create.
- **Expected:** có step indicator + next/back, create thành công.
- **Linked requirements:** VAT136-RQ-003.

### BM-03 — Persist semantic onboarding context
- **Goal:** journeyType/entryIntent không bị rơi.
- **Steps:** tạo project manga -> gọi API project data.
- **Expected:** onboardingContext chứa journeyType + entryIntent + sourceType.
- **Linked requirements:** VAT136-RQ-002.

---

## B. Compatibility/regression benchmarks

### BM-04 — Legacy deep-link quickManga=1
- **Goal:** không gãy continuity link cũ.
- **Steps:** mở URL project với `?stage=script&quickManga=1`.
- **Expected:** vào đúng manga context, không crash/redirect sai.
- **Linked requirements:** VAT136-RQ-007.

### BM-05 — quick-manga/history API schema stability
- **Goal:** tránh breaking contract ngầm với UI/history.
- **Steps:** gọi endpoints quick-manga/history trước/sau thay đổi.
- **Expected:** schema fields ổn định (không drop field bắt buộc).
- **Linked requirements:** VAT136-RQ-007.

---

## C. Product semantics / copy benchmarks

### BM-06 — Manga identity persist ở project detail
- **Goal:** user mở project từ list vẫn nhận biết lane.
- **Steps:** tạo project manga -> quay lại list -> mở lại detail.
- **Expected:** badge/label lane manga còn hiển thị.
- **Linked requirements:** VAT136-RQ-001.

### BM-07 — Giảm video-first bleed trong lane manga
- **Goal:** giảm nhiễu mental model.
- **Steps:** vào lane manga, rà labels/section names.
- **Expected:** thuật ngữ manga/webtoon là primary; không copy kiểu feature phụ.
- **Linked requirements:** VAT136-RQ-005.

---

## D. Data mapping / settings benchmarks

### BM-08 — Anifun layout mapping integrity
- **Goal:** mapping 13 layouts + 6 presets usable ở runtime config.
- **Steps:** parse `docs/ux/layout_map.json`, kiểm số lượng + key bắt buộc.
- **Expected:** đủ anifun_t01..t13; confidence phân tầng đúng.
- **Linked requirements:** VAT136-RQ-004.

### BM-09 — P0 template specs availability
- **Goal:** xác nhận slice P0 có thể dùng ngay.
- **Steps:** kiểm `src/lib/workspace/manga-webtoon-layout-map.ts` exports.
- **Expected:** có các template specs và sourceLayoutId traceable.
- **Linked requirements:** VAT136-RQ-004.

---

## E. Telemetry benchmarks

### BM-10 — Wizard step analytics events
- **Goal:** funnel có dữ liệu step-level.
- **Steps:** thao tác wizard view/next/back.
- **Expected:** emit event tương ứng (step_view, step_next, step_back).
- **Linked requirements:** VAT136-RQ-006.

### BM-11 — Mandatory dimension completeness
- **Goal:** dữ liệu analytics so sánh lane được.
- **Steps:** audit sample payload event.
- **Expected:** đủ `journeyType`, `entryIntent`, `templateId`, `locale`, `projectId`.
- **Linked requirements:** VAT136-RQ-006.

---

## F. Suggested execution order

1. BM-01 -> BM-03 (golden path)
2. BM-04 -> BM-05 (compatibility)
3. BM-06 -> BM-07 (product semantics)
4. BM-08 -> BM-09 (mapping)
5. BM-10 -> BM-11 (telemetry)

Nếu fail ở BM-04/BM-05 thì chặn rollout P2 vì rủi ro continuity cao.