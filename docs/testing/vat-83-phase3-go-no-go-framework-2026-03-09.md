# VAT-83 Phase 3 - Go/No-Go framework cho tách mode `manga-generator`

Thời gian: 2026-03-09 (GMT+7)

## 1) Jira context đã đọc
- Epic: [VAT-60](https://linktovn.atlassian.net/browse/VAT-60)
- Story: [VAT-83](https://linktovn.atlassian.net/browse/VAT-83)
- Sub-task dữ liệu: [VAT-84](https://linktovn.atlassian.net/browse/VAT-84)
- Comment kickoff đã đối chiếu:
  - VAT-60 comment `13263`, `13290`
  - VAT-83 comment `13267`

## 2) Root analysis ngắn
Research VAT-59 và rollout Phase 0 cho thấy định hướng đúng là **không tách mode sớm**. Điểm thiếu lớn nhất trước Phase 3 là chưa có framework đo **đủ điều kiện tách mode** và chưa có bộ metric adoption/churn có thể đối soát định kỳ. Vì vậy VAT-83 tập trung tạo decision package có thể lặp lại theo chu kỳ (weekly gate review), tránh quyết định cảm tính.

## 3) Decision package (Go/No-Go)

### 3.1 Gate nhóm Product Adoption
Đề xuất ngưỡng tối thiểu trong rolling 14 ngày:
- `quickManga.total >= 30` task hợp lệ.
- `quickManga.activeProjects >= 5`.
- `adoptionProxy.volumePctAgainstCoreFlows >= 20%`.
- `quickManga.churnProxy.repeatUsersWithin7d / max(activeUsers,1) >= 35%`.

Ý nghĩa: mode riêng chỉ có ý nghĩa khi adoption thực sự vượt mức thử nghiệm và có retention tín hiệu dương.

### 3.2 Gate nhóm Reliability / Ops
- Success rate quick manga (`completed / total`) >= 92%.
- Không có errorCode đơn lẻ > 40% trong failed sample.
- P95 queue-to-finish không kém hơn lane hiện tại quá 20% (so với baseline core flow).

### 3.3 Gate nhóm Architecture & Migration Safety
- Contract API mới được định nghĩa song song (backward compatible) tối thiểu 1 release.
- Có migration map rõ từ `novel-promotion quick_manga:*` sang namespace mode mới.
- Có rollback plan trong <= 30 phút bằng feature flag (không data-loss).

### 3.4 Rule ra quyết định
- **Go** khi tất cả gate pass trong 2 chu kỳ review liên tiếp (ít nhất 2 tuần).
- **No-Go** khi 1 trong 3 nhóm gate fail nghiêm trọng hoặc thiếu dữ liệu adoption/churn.
- **Conditional-Go** chỉ dùng khi Adoption + Reliability pass, còn Architecture có blocker đã có owner và ETA <= 1 sprint.

## 4) Migration strategy (nếu Go)
1. **Stage A - Shadow mode contract**
   - Thêm namespace contract mới cho manga-generator, giữ route cũ hoạt động.
   - Event/telemetry dual-write cho 1 chu kỳ release.
2. **Stage B - Controlled cutover**
   - Bật feature flag theo project allowlist.
   - Theo dõi adoption/reliability dashboard mỗi ngày.
3. **Stage C - Full switch**
   - Chuyển mặc định sang mode mới khi KPI giữ ổn định >= 14 ngày.
4. **Stage D - Cleanup**
   - Dừng ghi legacy namespace sau freeze window + backup.

## 5) Rollback plan
- Trigger rollback: success rate giảm > 8 điểm phần trăm so baseline hoặc lỗi P1/P2 tăng đột biến.
- Hành động rollback:
  1. Tắt feature flag manga-generator mode mới.
  2. Route toàn bộ request về lane novel-promotion quick manga cũ.
  3. Giữ read-only telemetry mode mới để phục vụ RCA.
- RTO mục tiêu: <= 30 phút.

## 6) Kết luận tạm thời cho VAT-83 tại thời điểm hiện tại
Dựa trên baseline hiện có (xem VAT-84 report), dữ liệu adoption/churn chưa đủ để vượt gate Product Adoption. Do đó trạng thái quyết định hiện tại là:

> **No-Go (tạm thời)** - tiếp tục vận hành trong novel-promotion lane, thu thập thêm dữ liệu trong các chu kỳ tiếp theo.

## 7) Không làm
- Không tạo mode mới.
- Không thay đổi luồng production.
