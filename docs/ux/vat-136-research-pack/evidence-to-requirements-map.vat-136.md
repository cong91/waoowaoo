# VAT-136 — Evidence Pack → Product Requirements Mapping

## Mục tiêu
Traceability matrix để team biết mỗi requirement đến từ evidence nào, tránh tranh luận cảm tính khi triển khai VAT-131 P2.

---

## 1) Evidence inventory (đầu vào)

| Evidence ID | Artifact | Nội dung chính |
|---|---|---|
| E-ANIFUN-01 | `docs/ux/layout_map.json` | 13 panel templates + 6 preset references từ Anifun |
| E-ANIFUN-02 | `docs/ux/vat-132-vat-133-manga-webtoon-settings-schema-draft-2026-03-11.md` | Schema draft mapping settings + confidence notes |
| E-AUDIT-01 | `docs/ux/vat-manga-webtoon-ux-flow-analysis-2026-03-11-web-validated.md` | Audit UX web thật: shared shell, video-first bleed, quickManga overlay |
| E-CHAIN-01 | `docs/testing/vat-117-spec-mapping-matrix-2026-03-10.md` | Mapping final analysis -> implementable AC M1..M10 |
| E-CHAIN-02 | `docs/testing/vat-118-ia-screen-flow-create-manga-webtoon-2026-03-10.md` | IA + flow chi tiết entry/create/onboarding |
| E-CHAIN-03 | `docs/testing/vat-120-uat-execution-dual-journey-pass2-2026-03-10.md` | UAT pass2: wizard, context persistence, compatibility |
| E-CHAIN-04 | `docs/testing/vat-114-manga-webtoon-journey-rebuild-phase-d-execution-2026-03-10.md` | Story-level consolidation + telemetry gate readiness |

---

## 2) Mapping evidence -> requirement

| Requirement ID | Evidence IDs | Vì sao cần requirement này |
|---|---|---|
| VAT136-RQ-001 | E-AUDIT-01, E-CHAIN-01 | Audit xác nhận lane identity mất ở detail; M1 yêu cầu dual-journey rõ ràng. |
| VAT136-RQ-002 | E-CHAIN-02, E-CHAIN-01, E-CHAIN-03 | Intent contract đã được define + UAT cho thấy context persistence là critical. |
| VAT136-RQ-003 | E-CHAIN-02, E-CHAIN-03 | Flow 3 bước là blueprint đã test thực tế ở pass2. |
| VAT136-RQ-004 | E-ANIFUN-01, E-ANIFUN-02 | Anifun evidence đã đủ để materialize schema/layout mapping có confidence. |
| VAT136-RQ-005 | E-AUDIT-01 | Video-first bleed là issue thực tế được xác nhận bằng web testing. |
| VAT136-RQ-006 | E-CHAIN-01, E-CHAIN-04 | Telemetry dimension được đóng vai gate Phase D; cần bắt buộc hóa. |
| VAT136-RQ-007 | E-CHAIN-03, E-CHAIN-01 | quickManga compatibility được chứng minh cần giữ để không gãy continuity. |
| VAT136-RQ-008 | E-ANIFUN-01, E-AUDIT-01, E-CHAIN-01/02/03/04 | VAT-136 yêu cầu đóng gói usable pack từ toàn bộ evidence phân tán. |

---

## 3) Requirement coverage check

- Tổng requirements materialized: **8**
- Requirement có ít nhất 1 evidence nguồn: **8/8 (100%)**
- Requirement có từ 2 evidence trở lên: **7/8**
- Requirement có test signal rõ trong matrix: **8/8 (100%)**

---

## 4) Gợi ý governance cho sprint tiếp theo

1. Khi thêm requirement mới cho VAT-131 P2, bắt buộc thêm dòng mapping evidence.
2. Không merge requirement không có evidence ID.
3. Nếu evidence mâu thuẫn, ưu tiên web-validated audit + UAT pass gần nhất và ghi decision note rõ.
