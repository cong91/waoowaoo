# Task 1 — Fix locale consistency in manga/webtoon beginner flow

## Problem
The production manga flow currently mixes English and Vietnamese on the same screen, reducing trust and increasing cognitive load.

## Scope
- audit strings rendered on workspace manga entry and manga project page
- fix mixed-language surfaces in the selected locale
- ensure the primary beginner journey renders consistently in one language per locale

## Example findings
- `Currently editing: Tập 1`
- `Asset Library`
- `Settings`
- `Refresh Data`
- mixed with Vietnamese explanatory strings on the same page

## Acceptance criteria
- no mixed English/Vietnamese copy in the main beginner manga flow when locale is English or Vietnamese
- CTA labels, section titles, helper text, stage labels, and primary notices are locale-consistent
- no regression to film/video locale behavior
