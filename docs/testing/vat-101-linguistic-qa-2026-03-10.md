# VAT-101 — Linguistic QA + Screenshot Evidence (2026-03-10)

- Ticket: https://linktovn.atlassian.net/browse/VAT-101
- Parent story: https://linktovn.atlassian.net/browse/VAT-98
- Epic: https://linktovn.atlassian.net/browse/VAT-85
- Scope pass này: **chỉ VAT-101** (linguistic QA + evidence trước release), kế thừa baseline glossary VAT-99 và i18n refactor VAT-100.

## 1) Context đã đọc trước khi QA

- VAT-85: mục tiêu Phase 2 là chuẩn hoá copy/localization cho Manga xuyên suốt.
- VAT-98: story cha của lane Content (glossary + i18n + QA trước release).
- VAT-101: yêu cầu sub-task tập trung linguistic QA + screenshot evidence.

## 2) Baseline kế thừa

- Glossary baseline: `docs/localization/vat-99-manga-terminology-glossary-vi-en-zh-2026-03-10.md`
- i18n refactor baseline: VAT-100 (comment Jira ID 13421, commit `62c0dab0d2df3e9920f5f443f78b4621695769dc`)

## 3) Kiểm tra linguistic (EN/VI/ZH/KO)

Nguồn dữ liệu: `messages/{en,vi,zh,ko}/novel-promotion.json`, nhóm key `storyInput.manga.*`.

Các key mẫu kiểm tra:
- `storyInput.manga.title`
- `storyInput.manga.toggle`
- `storyInput.manga.history.empty`
- `storyInput.manga.regenerate.invalidSource`

Kết quả:
- EN: nhất quán dùng “Manga” (không còn “quick manga”).
- VI: copy tự nhiên, đúng glossary, không pha thuật ngữ nội bộ.
- ZH: copy UI công khai giữ canonical term “Manga”, ngữ nghĩa rõ.
- KO: copy đồng bộ với glossary và flow lịch sử/regenerate.

## 4) Evidence artifacts

- HTML evidence (bảng đối chiếu đa ngôn ngữ):
  - `docs/testing/evidence/vat-101-manga-localization-qa.html`
- Screenshot evidence (full page):
  - `docs/testing/evidence/vat-101-linguistic-qa-screenshot.png`

## 5) Verify commands & kết quả

### 5.1 Linguistic residue check (quick manga)

Đã chạy kiểm tra regex trên subtree `storyInput.manga.*` của cả 4 locale.

Kết quả: **0 hit** cho các pattern `quick manga` / `Quick Manga` / `quick_manga` trong payload user-facing của nhóm key Manga.

### 5.2 Focused regression test (i18n entrypoint)

```bash
npx vitest run tests/unit/workspace/manga-entrypoint-i18n.test.ts
```

Kết quả: ✅ PASS (2/2)

## 6) Kết luận VAT-101

VAT-101 đạt yêu cầu scope: linguistic QA completed + screenshot/evidence attached; không mở rộng sang task khác và không deploy production.
