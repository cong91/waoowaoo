# UX Epic Draft — VAT-131 Manga/Webtoon beginner usability hardening

## Summary
Improve the production manga/webtoon creation experience so a first-time, non-expert creator can discover the manga lane, understand what to do next, and successfully generate manga panels with lower confusion and higher trust.

## Why this epic exists
The production audit confirmed that the manga/webtoon flow is functionally real, but not yet beginner-friendly enough. Main issues:
- cognitive overload
- mixed locale strings on the same page
- CTA wording mismatch with user expectation
- system-model language leaking into beginner path
- internal/demo framing distracting from manga creation
- noisy project list reducing trust
- quick actions lacking first-use guidance

## Success criteria
- user can identify the manga path in workspace without ambiguity
- user can understand the first recommended action within 5–10 seconds
- user can start generation from short story input without needing internal terminology
- page exposes advanced controls progressively instead of all at once
- locale is consistent within the same journey
- project list in production no longer undermines trust

## Non-goals
- no claim that all advanced controls should disappear
- no claim that benchmark/performance work is solved by UX changes alone
- no broad redesign of film/video lane unless directly required by shared components

## Source audit
- `docs/ux/vat-131-production-manga-ux-audit-2026-03-15.md`
