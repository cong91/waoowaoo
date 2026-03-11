# VAT-136 — Manga/Webtoon Research Pack (Materialization lane)

**Ngày:** 2026-03-11  
**Scope:** Materialization artifact cho team Product/Design/FE/QA sử dụng ngay (không deploy, không đổi provider)

---

## 1) Mục tiêu gói VAT-136

Chuẩn hoá toàn bộ evidence trọng yếu (Anifun capture + audit VAT hiện tại + VAT-131 stories liên quan) thành **source-of-truth usable** để:

1. Team FE implement nhanh theo requirement rõ ràng.
2. Team QA có acceptance matrix test được ngay, có pass/fail signal.
3. Team Product trace được vì sao requirement tồn tại (evidence-backed).

---

## 2) Source-of-truth inputs đã dùng

### 2.1 Anifun evidence / schema
- `docs/ux/vat-132-vat-133-manga-webtoon-settings-schema-draft-2026-03-11.md`
- `docs/ux/layout_map.json`
- `src/lib/workspace/manga-webtoon-layout-map.ts` (P0 mapping slice đã materialize)

### 2.2 Audit UX VAT hiện tại (web-validated)
- `docs/ux/vat-manga-webtoon-ux-flow-analysis-2026-03-11-web-validated.md`

### 2.3 Chuỗi story/acceptance đã có trong VAT-131 lane
- `docs/testing/vat-114-manga-webtoon-journey-rebuild-phase-d-execution-2026-03-10.md`
- `docs/testing/vat-117-spec-mapping-matrix-2026-03-10.md`
- `docs/testing/vat-118-ia-screen-flow-create-manga-webtoon-2026-03-10.md`
- `docs/testing/vat-120-uat-execution-dual-journey-pass2-2026-03-10.md`

---

## 3) Output artifacts trong pack này

1. `acceptance-matrix.vat-136.yaml`
   - Matrix yêu cầu/AC/owner/evidence/test-signal ở dạng machine-readable.

2. `acceptance-matrix.vat-136.md`
   - Bản đọc nhanh cho PM/QA/FE dùng trong grooming/UAT.

3. `benchmark-cases.vat-136.md`
   - Danh sách benchmark cases ưu tiên (golden path + regression + compatibility).

4. `evidence-to-requirements-map.vat-136.md`
   - Mapping từ evidence pack -> product requirements (traceability matrix).

---

## 4) Cách team dùng ngay (khuyến nghị)

1. **Planning/Grooming**: dùng `acceptance-matrix.vat-136.md` làm checklist decomposition task.
2. **Implementation**: bám `acceptance-matrix.vat-136.yaml` để tạo ticket con theo requirement ID.
3. **QA/UAT**: chạy theo `benchmark-cases.vat-136.md` và cập nhật PASS/FAIL theo acceptance signal.
4. **Change review**: mọi thay đổi requirement phải cập nhật đồng thời file YAML + map traceability.

---

## 5) Non-goals lane này

- Không chỉnh runtime behavior production.
- Không deploy.
- Không thay kiến trúc provider/model.

---

## 6) Decision note cho P2

Pack này chốt phần **materialization** của VAT-136: chuyển tri thức phân tán thành bộ artifact có thể dùng trực tiếp cho coding + QA, giảm mơ hồ khi triển khai P2 VAT-131.