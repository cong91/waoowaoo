# VAT-84 Phase 3 - Adoption/Churn metrics Quick Manga (Phase 0-1 baseline)

Thời gian: 2026-03-09 (GMT+7)

## 1) Jira context đã đọc
- Parent story: [VAT-83](https://linktovn.atlassian.net/browse/VAT-83)
- Sub-task: [VAT-84](https://linktovn.atlassian.net/browse/VAT-84)
- Epic tham chiếu: [VAT-60](https://linktovn.atlassian.net/browse/VAT-60)
- Kickoff comment đã đối chiếu: VAT-83 comment `13267`

## 2) Root analysis ngắn
Phase 3 cần metric đủ tin cậy để hỗ trợ quyết định Go/No-Go. Hệ thống đã có script baseline ở Phase 0 nhưng chưa tách rõ chỉ số adoption/churn phục vụ quyết định tách mode. VAT-84 bổ sung script metrics chuyên dụng để tạo snapshot định kỳ cho Quick Manga so với core flow nền.

## 3) Artifacts tạo mới
- `scripts/quick-manga-phase-metrics.ts`
  - Input: `--days` (default 30)
  - Output log JSON gồm:
    - Quick Manga totals/status/stage/day
    - Adoption proxy vs core flows (`story_to_script_run`, `script_to_storyboard_run`)
    - Churn proxy (`repeatUsersWithin7d`, `atRiskUsersNoRepeatAfter7d`)

## 4) Commands và kết quả

### 4.1 Chạy metrics script (30 ngày)
```bash
DATABASE_URL='mysql://root:waoowaoo123@127.0.0.1:13306/waoowaoo' \
REDIS_HOST=127.0.0.1 REDIS_PORT=16379 \
NEXTAUTH_SECRET='local-dev-secret' CRON_SECRET='local-dev-cron' \
INTERNAL_TASK_TOKEN='local-dev-token' API_ENCRYPTION_KEY='local-dev-enc' \
LOG_LEVEL=INFO \
npx tsx scripts/quick-manga-phase-metrics.ts --days=30
```

Snapshot chính:
- quickManga.total = 0
- quickManga.activeProjects = 0
- adoptionProxy.volumePctAgainstCoreFlows = 0
- baselineCoreFlows.total = 18 (2 projects)

=> Kết luận dữ liệu: **chưa có mẫu adoption Quick Manga thực tế** trong window đo.

### 4.2 Đối chiếu baseline script hiện có (72h)
```bash
DATABASE_URL='mysql://root:waoowaoo123@127.0.0.1:13306/waoowaoo' ... \
npx tsx scripts/quick-manga-telemetry-baseline.ts --hours=72
```

Snapshot đối chiếu:
- Quick Manga totals vẫn = 0
- Core flow vẫn có traffic (`story_to_script_run` completed=5/failed=7, `script_to_storyboard_run` completed=4/failed=2)

## 5) Ý nghĩa với VAT-83
Dữ liệu VAT-84 xác nhận trạng thái hiện tại là **insufficient sample** cho decision Go. Vì adoption/churn của Quick Manga chưa có traffic đủ để suy luận, nên gate Product Adoption ở VAT-83 chưa thể pass.

## 6) Không làm
- Không deploy production.
- Không thay đổi runtime flow; chỉ bổ sung script analytics và báo cáo.
