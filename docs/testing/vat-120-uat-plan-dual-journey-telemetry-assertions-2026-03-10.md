# VAT-120 — [Manga/Webtoon] Test/UAT plan riêng cho journey mới + telemetry assertions

- Ticket: https://linktovn.atlassian.net/browse/VAT-120
- Parent story: https://linktovn.atlassian.net/browse/VAT-114
- Date: 2026-03-10
- Strategy: `code_with_build`
- Scope: Test/UAT plan + telemetry assertions cho dual-journey rollout (không thay đổi runtime/API behavior trong pass này).

---

## 1) Jira context read-first (đã thực hiện trước khi làm)

- Issue key: `VAT-120`
- Summary: `[Manga/Webtoon] Test/UAT plan riêng cho journey mới + telemetry assertions`
- Type: `Subtask`
- Parent: `VAT-114`
- Start status: `To Do`
- Labels: `dual-journey`, `manga-webtoon`, `vat-110-reset`
- Description (Jira): `Kế hoạch QA/UAT và tiêu chí pass cho dual-journey telemetry.`

Read evidence file: `/tmp/vat-120-jira-read.json`

---

## 2) Scope guard (strictly VAT-120)

Pass này chỉ tập trung vào:
1. Chuẩn hoá test/UAT plan cho dual journey (`manga_webtoon` vs `film_video`).
2. Định nghĩa telemetry assertions có thể verify được trong unit/integration/UAT.
3. Bổ sung test regression cho telemetry dimensions bắt buộc.

Không làm trong VAT-120:
- Không đổi API schema.
- Không refactor runtime worker.
- Không deploy production.

---

## 3) Telemetry contract cần assert trong UAT

Các event trong journey funnel phải có thể đối soát theo cùng frame:

- `workspace_journey_selected`
- `workspace_template_selected`
- `workspace_project_created`

### Mandatory dimensions

Mọi assertion/UAT checklist trong VAT-120 dùng các dimension sau làm baseline:

- `journeyType` (`manga_webtoon | film_video`)
- `entryIntent`
- `templateId` (nếu có bước chọn template)
- `locale`
- `projectId` (sau khi tạo project)

Ghi chú compatibility:
- Legacy bridge events dạng `workspace_manga_*` vẫn được phép tồn tại,
- nhưng telemetry kiểm thử phải đối soát trên neutral taxonomy `workspace_*` để so sánh hai journey cân bằng.

---

## 4) Test/UAT matrix cho dual-journey

| Layer | Scenario | Expected telemetry assertions | Status target |
|---|---|---|---|
| Unit | Chọn journey Manga/Webtoon từ workspace | Emit `workspace_journey_selected` với `journeyType=manga_webtoon`, có `entryIntent`, `locale` | PASS |
| Unit | Chọn template Manga/Webtoon | Emit `workspace_template_selected` với `journeyType`, `entryIntent`, `templateId`, `locale`, `projectId` context nếu đã có | PASS |
| Unit | Tạo project từ lane Manga | Emit `workspace_project_created` có `journeyType=manga_webtoon`, `entryIntent`, `projectId` | PASS |
| Integration API | Create project với `journeyType=manga_webtoon` | Contract mapping giữ compatibility `projectMode` và không phá deep-link logic | PASS |
| Regression | Legacy quickManga deep-link | `?quickManga=1` vẫn vào đúng context Manga | PASS |
| UAT manual | End-to-end create từ journey card -> template -> project | Chuỗi event xuất hiện đúng thứ tự với dimension đầy đủ | PASS |

---

## 5) UAT checklist (manual)

1. Vào workspace, xác nhận hiển thị 2 journey cards (Manga/Webtoon + Film/Video).
2. Click Manga/Webtoon card:
   - xác nhận event `workspace_journey_selected` với `journeyType=manga_webtoon`.
3. Trong create flow, chọn 1 template:
   - xác nhận event `workspace_template_selected` có `templateId` và `entryIntent`.
4. Submit tạo project:
   - xác nhận event `workspace_project_created` có `projectId`, `journeyType`, `locale`.
5. Mở deep-link legacy `?stage=script&quickManga=1`:
   - xác nhận không regression context (compatibility pass).

UAT pass criteria:
- Không missing mandatory dimensions ở event trong funnel.
- Không xuất hiện mismatch `journeyType` theo lane người dùng chọn.
- Không có breaking behavior trên legacy quick-manga entry.

---

## 6) Code evidence added in VAT-120

### 6.1 Unit test bổ sung telemetry assertion

File cập nhật:
- `tests/unit/helpers/manga-discovery-analytics.test.ts`

Case mới:
- `keeps telemetry dimensions intact for journey template selection assertions`

Assertion chính:
- Khi emit `workspace_template_selected`, log event phải chứa đầy đủ:
  - `journeyType`
  - `entryIntent`
  - `templateId`
  - `locale`
  - `projectId`

Mục tiêu: lock contract cho telemetry dimensions trọng yếu trong UAT plan.

---

## 7) Validation commands (code_with_build)

Đã chạy:

```bash
npx vitest run tests/unit/helpers/manga-discovery-analytics.test.ts
npm run build
```

Kỳ vọng pass:
- Unit test telemetry helper pass.
- Build pass để đảm bảo không có regression compile/runtime contract.

---

## 8) DoD cho VAT-120

- [x] Jira context được đọc trước khi thực hiện.
- [x] Scope giữ đúng VAT-120 (plan + telemetry assertions).
- [x] Có bổ sung test assertion cho telemetry dimensions.
- [x] Có run test + build theo strategy `code_with_build`.
- [ ] Jira comment evidence (sau khi post).
- [ ] Jira status transition evidence (sau khi transition).

---

## 9) Handover

Artifact này là test/UAT SoT cho lane dual-journey telemetry trong VAT-114 chain.

Khuyến nghị cho execution tiếp theo:
1. Dùng checklist mục 5 làm script UAT chính thức.
2. Reuse unit assertion mới như guardrail cho telemetry schema.
3. Chỉ merge các thay đổi journey mới khi mandatory dimensions không bị thiếu trong sample logs.