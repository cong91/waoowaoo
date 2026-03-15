# VAT-136 — Acceptance Matrix (Research Pack materialization)

## Tóm tắt

Bảng này là bản đọc nhanh từ `acceptance-matrix.vat-136.yaml`, dùng cho grooming + implementation + QA.

| Requirement ID | Priority | Owner | Mục tiêu | Trạng thái materialization |
|---|---|---|---|---|
| VAT136-RQ-001 | P0 | FE + Product | Persist journey identity xuyên suốt | ✅ Documented |
| VAT136-RQ-002 | P0 | FE + BE | Semantic contract create manga (journeyType/entryIntent) | ✅ Documented |
| VAT136-RQ-003 | P0 | FE | Wizard 3 bước manga onboarding | ✅ Documented |
| VAT136-RQ-004 | P1 | FE + Design | Map Anifun layouts/presets vào schema dùng được | ✅ Documented |
| VAT136-RQ-005 | P1 | Product + FE | Giảm video-first bleed | ✅ Documented |
| VAT136-RQ-006 | P1 | FE + Data | Telemetry dual-journey đủ dimension | ✅ Documented |
| VAT136-RQ-007 | P0 | FE + QA | Compatibility bridge không gãy legacy | ✅ Documented |
| VAT136-RQ-008 | P0 | Product + QA | Bộ docs usable ngay cho handoff | ✅ Documented |

---

## Chi tiết AC theo nhóm thực thi

## Nhóm A — Product identity & IA

### VAT136-RQ-001 (P0)
- Header project detail phải có lane badge cố định.
- Project list phải có lane chip để nhận diện nhanh.
- Không dùng query flag làm nguồn duy nhất cho identity.

**Evidence:** audit web-validated + VAT-117 M1.

### VAT136-RQ-005 (P1)
- Lane Manga ưu tiên ngôn ngữ manga/webtoon hơn vocabulary video.
- Copy không đóng khung manga là shortcut/feature phụ.
- Manga history/continuity controls đẩy vào nhóm primary.

**Evidence:** web-validated issue mục 2.4.

---

## Nhóm B — Flow contract & compatibility

### VAT136-RQ-002 (P0)
- POST create project cần `journeyType=manga_webtoon`, `entryIntent` rõ.
- Project data API trả onboardingContext giữ được semantic fields.
- quickManga=1 chỉ là bridge compatibility.

### VAT136-RQ-003 (P0)
- Wizard 3 bước: Hành trình -> Template -> Nguồn nội dung.
- Có back/next và giữ state.
- Finish vào runtime đúng context manga.

### VAT136-RQ-007 (P0)
- Legacy deep-link `quickManga=1` vẫn mở đúng manga context.
- quick-manga/history schema không bị breaking.
- Regression bookmark cũ phải pass.

---

## Nhóm C — Data/model/telemetry

### VAT136-RQ-004 (P1)
- Layout catalog `anifun_t01..anifun_t13` dùng từ mapping.
- Có metadata layoutFamily/panelSlotCount/colorMode/suggested presets.
- Confidence phân tầng rõ t01..03 low, t04..13 high.

### VAT136-RQ-006 (P1)
- Event chứa đủ `journeyType`, `entryIntent`, `templateId`, `locale`, `projectId`.
- Transition period có both old/new dimensions.
- Có doc đối chiếu dimension cho data audit.

---

## Handover checklist nhanh cho QA

- [ ] Chạy smoke theo benchmark list.
- [ ] Xác nhận lane identity ở entry/list/detail.
- [ ] Xác nhận wizard 3-step + back/next state retention.
- [ ] Xác nhận quickManga legacy deep-link.
- [ ] Kiểm event payload có đủ mandatory fields.
- [ ] Ghi PASS/FAIL theo từng requirement ID.
