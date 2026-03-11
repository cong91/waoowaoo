# VAT UX Analysis (Web-Validated) — Manga/Webtoon vs Video/Film

**Date:** 2026-03-11 (GMT+7)  
**Mode:** Analysis-only, no code change, no deploy  
**Method:** Trải nghiệm trực tiếp trên production web app (`https://videoai.linkto.com.vn`) bằng tài khoản test được cung cấp

---

## 1) Test protocol (đã chạy thật)

### 1.1 Login thực tế
- URL: `https://videoai.linkto.com.vn`
- Đăng nhập bằng:
  - username: `sean`
  - password: `123456`
- Kết quả: login thành công, vào workspace list.

### 1.2 Flows đã test end-to-end

#### A. Entry workspace
- Truy cập `/workspace` sau login.
- Quan sát 2 card entry:
  - **Tạo Video / Film** → `Story Studio`
  - **Tạo Manga / Webtoon** → `Manga Quick Start`

#### B. Create flow Video/Film
- Chọn card Video/Film.
- Wizard 3 bước được hiển thị:
  1. Hành trình
  2. Template
  3. Nguồn nội dung
- Tạo project test:
  - Name: `UX Film Flow Test 20260311-0048`
  - Desc: `analysis run film journey`
- Sau tạo, vào project detail runtime và xác nhận stage chính.

#### C. Create flow Manga/Webtoon
- Chọn card Manga/Webtoon.
- Wizard 3 bước tương tự (khung giống Video/Film, template khác).
- Tạo project test:
  - Name: `UX Manga Flow Test 20260311-0051`
  - Desc: `analysis run manga journey`
- Sau tạo, URL vào project có param:
  - `?stage=script&quickManga=1`
- Vào detail và xác nhận trạng thái Manga.

#### D. Project/workspace detail sau tạo
- Mở cả 2 project mới tạo từ danh sách để so sánh trực tiếp:
  - `/workspace/5df586e4-8d92-4a54-89f1-9049d809676b` (film test)
  - `/workspace/5edecd7a-ac43-43eb-a509-0b8725f9b7d9` (manga test)
- So sánh header, tabs, controls, CTA, IA.

---

## 2) Evidence UX quan sát trực tiếp trên web thật

## 2.1 Entry layer đã “2 lane”, nhưng copy Manga vẫn mô tả như shortcut
Tại workspace list:
- Video card: `Story Studio` + “Flow chuẩn cho screenplay/video nhiều tập”
- Manga card: `Manga Quick Start` + “Vào thẳng Script + bật Quick Manga mặc định”

=> Copy Manga đang truyền thông điệp: **đây là đường tắt vào flow hiện tại**, không phải lane sản phẩm độc lập.

## 2.2 Sau create, cả 2 lane hội tụ về cùng workspace shell
Trong project detail của cả film và manga đều có cùng cấu trúc chính:
- Tabs: `Câu chuyện`, `Kịch bản`, `Bảng phân cảnh`, `Băng hình`, `Trình chỉnh sửa AI`
- Action bar: `Thư viện nội dung`, `Cài đặt`, `Làm mới dữ liệu`

=> Nhận diện lane ở workspace-level gần như không tách biệt về cấu trúc điều hướng.

## 2.3 Manga lane kích hoạt bằng query flag và toggle trong editor
Với project manga mới tạo, URL có:
- `?stage=script&quickManga=1`

Trong màn `Câu chuyện`:
- xuất hiện block `Manga (Beta)`
- text: “Bật preset tối ưu cho Manga ngay trong editor hiện tại mà không cần chuyển sang mode riêng”
- toggle `Bật chế độ Manga`

=> Đây là bằng chứng trực tiếp của mô hình **capability overlay**, không phải journey runtime tách biệt.

## 2.4 Video-first bleed còn rõ trong màn Manga
Ngay cả khi Manga bật:
- vẫn có section `Tỷ lệ video` (ví dụ: `16:9`)
- vẫn giữ framing pipeline video/storyboard/video generation như lane film.

=> User làm Manga/Webtoon vẫn bị “ngôn ngữ video” bám theo ở vùng IA chính.

## 2.5 Tín hiệu mới tích cực cho Manga nhưng chưa đủ tạo journey độc lập
Khi `quickManga=1`, đã có thêm control nhóm Manga:
- Preset
- Bố cục khung
- Chế độ màu
- Khóa phong cách / Hồ sơ / Độ mạnh
- Chế độ liên tục theo chương / conflict policy
- `Lịch sử chạy Manga`

=> Năng lực domain có tăng mạnh, nhưng đóng vai trò panel phụ trong cùng shell runtime.

---

## 3) Current-state UX issues (trên web thật)

1. **Journey identity leakage**
   - Ở entry có 2 lane, nhưng vào detail thì identity lane không còn rõ (không có badge/header identity persistent như “Manga/Webtoon Project”).

2. **Mental model mâu thuẫn**
   - User chọn “Tạo Manga / Webtoon” nhưng trải nghiệm thực tế giống “Story editor chung + bật cờ Manga”.

3. **Copy gây hiểu nhầm về sản phẩm**
   - “Quick Start”, “bật trong editor hiện tại” làm user hiểu Manga là tính năng phụ, không phải core journey.

4. **IA chưa tách mục tiêu output**
   - Manga/Webtoon vẫn đi chung tuyến tab với film/video, không có lane-specific task framing ở mức thông tin kiến trúc.

5. **Video-first vocabulary bleed**
   - Các control/khái niệm video (ví dụ `Tỷ lệ video`) xuất hiện trong phiên Manga, gây nhiễu mục tiêu.

---

## 4) Gap giữa implementation hiện tại và UX kỳ vọng Manga/Webtoon

## 4.1 Kỳ vọng UX cho Manga/Webtoon
- User nhận biết rõ: đây là lane sản phẩm riêng, không phải mode phụ.
- Identity xuyên suốt từ create → detail → run history.
- IA và copy ưu tiên khái niệm Manga/Webtoon (paneling, chapter continuity, reading orientation) thay vì video-first.

## 4.2 Thực tế hiện tại
- Tách rõ ở entry/create card, nhưng detail/runtime vẫn shared shell.
- Kích hoạt lane manga phụ thuộc `quickManga=1` + toggle trong editor.
- Hiện diện control Manga tăng nhưng đặt trong cùng flow video-centric.

=> **Khoảng cách chính:** đã có capability-level differentiation, nhưng chưa đạt product-journey differentiation.

---

## 5) Đối chiếu artifact cũ (`vat-manga-webtoon-ux-flow-analysis-2026-03-11.md`)

Đánh giá sau kiểm thử web thật:
- Artifact cũ kết luận đúng hướng ở điểm “runtime còn shared” và “video-first bleed”.
- Tuy nhiên artifact cũ thiên về code/doc, chưa có chứng cứ thao tác thật.
- Bản web-validated này bổ sung xác thực bằng trải nghiệm thực tế:
  - Login thật bằng account test
  - Create thực project cho cả 2 lane
  - So sánh trực tiếp detail/runtime
  - Xác nhận URL/param và copy hiển thị trong UI

---

## 6) Đề xuất sửa cụ thể theo mức ưu tiên

## P0 — Clarify identity ngay ở runtime header (nhanh, ít rủi ro)
1. Thêm **journey badge cố định** tại project detail:
   - `Manga/Webtoon Project` hoặc `Film/Video Project`
2. Thêm subtitle lane-specific dưới tên project.
3. Ở project list card, hiển thị chip lane để user scan nhanh.

## P1 — Sửa copy để bỏ cảm giác “feature phụ”
1. Đổi `Manga Quick Start` sang nhãn sản phẩm trung tính hơn (ví dụ `Manga/Webtoon Studio`).
2. Bỏ copy public kiểu implementation detail: “bật Quick Manga”, “không cần chuyển mode riêng”.
3. Viết lại CTA theo goal output Manga/Webtoon.

## P1 — Lane-specific landing panel trong workspace
1. Khi vào project manga lần đầu, hiển thị panel “Manga kickoff” (orientation, chapter continuity, style lock defaults).
2. Khi vào project film, hiển thị panel “Film kickoff” (screenplay pacing, shot/video defaults).

## P2 — IA rebalance để giảm video-first bleed
1. Trong lane manga, đổi tên/ưu tiên khối `Tỷ lệ video` sang framing phù hợp (manga/webtoon layout-first).
2. Đẩy `Lịch sử chạy Manga` và continuity controls lên thành cụm primary, không chỉ supplemental.

## P3 — Tách sâu hơn nếu cần (sau telemetry/UAT)
- Chỉ cân nhắc split runtime shell sâu (hoặc stage emphasis khác biệt mạnh) khi dữ liệu usage chứng minh cần thiết.

---

## 7) Kết luận ngắn

Đã xác minh bằng web thật + đăng nhập thật: VAT hiện đã có nền móng dual-entry tốt, nhưng trải nghiệm sau create vẫn chủ yếu là **shared video-first workspace với Manga overlay**.  
Muốn user phân biệt rõ 2 journey, cần ưu tiên sửa **identity + copy + IA presentation** trước, rồi mới tính tách runtime sâu.

---

## 8) Artifact final

- **File mới (web-validated):**
  - `docs/ux/vat-manga-webtoon-ux-flow-analysis-2026-03-11-web-validated.md`
- **File tham chiếu trước đó:**
  - `docs/ux/vat-manga-webtoon-ux-flow-analysis-2026-03-11.md`
