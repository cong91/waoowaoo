# VAT-116 — Governance scope alignment (VAT-60/VAT-85 execution history)

- Ticket: https://linktovn.atlassian.net/browse/VAT-116
- Parent: https://linktovn.atlassian.net/browse/VAT-110
- Date: 2026-03-10
- Strategy: `doc_only`
- Scope: governance clarification only (không đổi runtime/API/UI)

## 1) Jira context read-first

Đã đọc context VAT-116 trước khi thực hiện:
- Summary: `[Governance] Scope alignment: chuẩn hóa trạng thái VAT-60/VAT-85 là execution history có scope drift so với spec mới`
- Type: Story
- Status lúc bắt đầu: `To Do`
- Labels: `dual-journey`, `manga-webtoon`, `vat-110-reset`

## 2) Scope alignment statement (chuẩn hóa)

### 2.1 Canonical framing sau reset spec

1. **VAT-60**: được chuẩn hóa là **execution history artifact** của giai đoạn trước.
2. **VAT-85**: được chuẩn hóa là **execution history artifact** của giai đoạn trước.
3. Cả hai ticket có giá trị tham chiếu evidence, nhưng **không còn là source-of-truth cho product framing hiện tại**.

### 2.2 Scope drift được chốt rõ

- Scope drift chính: framing lịch sử thiên về “đưa Manga vào lane kỹ thuật hiện hữu (`novel-promotion`)”, thay vì tách thành hai product journey độc lập ở tầng intent/journey.
- Spec mới (VAT-110 reset line) yêu cầu framing chuẩn là:
  - Journey A: `Create Video/Film`
  - Journey B: `Create Manga/Webtoon`

## 3) Governance rules áp dụng cho backlog tiếp theo

1. **History vs SoT rule**
   - VAT-60/VAT-85 chỉ dùng làm evidence và migration continuity input.
   - Không dùng VAT-60/VAT-85 làm SoT để quyết định framing sản phẩm mới.

2. **Decision precedence rule**
   - Khi có mâu thuẫn giữa execution history và spec reset mới, ưu tiên spec reset.
   - Mọi reuse từ VAT-60/VAT-85 phải đi qua checklist “scope-safe reuse” (chỉ reuse capability, không reuse framing).

3. **Documentation rule**
   - Mọi ticket thuộc VAT-110 reset line cần ghi rõ một câu chuẩn:
     - `VAT-60/VAT-85 are treated as execution history with scope drift relative to the new dual-journey spec.`

4. **Out-of-scope guard (pass VAT-116)**
   - Không chỉnh code runtime.
   - Không đổi API contract đang chạy.
   - Không deploy.

## 4) Evidence map

- Final analysis reference: `docs/ux/vat-dual-journey-separation-final-analysis-2026-03-10.md`
  - Nêu rõ VAT-60/VAT-85 là execution history và có scope drift.
- Mapping reference: `docs/testing/vat-117-spec-mapping-matrix-2026-03-10.md`
  - Chuyển final analysis thành AC implementable cho line triển khai tiếp theo.

## 5) DoD for VAT-116 (doc_only)

- [x] Jira context read-first.
- [x] Chuẩn hóa tuyên bố governance cho VAT-60/VAT-85 thành execution history có scope drift.
- [x] Ghi rõ rule ưu tiên spec reset mới khi conflict.
- [x] Không thay đổi code/runtime/API.
