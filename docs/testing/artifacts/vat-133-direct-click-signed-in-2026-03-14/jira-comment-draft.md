VAT-133 runtime evidence update (2026-03-14)

Summary
- Rebuilt and redeployed signed-in runtime with verified VAT-133 source markers.
- Confirmed Webtoon quick-action bar renders on the real signed-in project runtime.
- Confirmed direct-click backend/runtime mutations for all 5 actions: Add, Duplicate, Split, Merge, Reorder.

Runtime/source verification
- image: `vat-app:vat133fix`
- image id: `73716cf9f333`
- container: `waoowaoo-app`
- source markers verified inside running container `MangaPanelControls.tsx`:
  - `shouldShowQuickActions`
  - `Webtoon panel quick actions (P1)`
  - `data-vat133-quick-actions-gate="hidden"`
- runtime health:
  - `/vi/workspace` returned `HTTP 200`
  - Redis / workers / watchdog all connected and ready

Signed-in DOM verification
- target runtime URL:
  - `http://127.0.0.1:13000/vi/workspace/11895b41-c233-49f3-823f-c4d0894c1c20?stage=script&quickManga=1&episode=9a32f0f4-e57b-488c-9f95-cc1021b29148`
- quick-action heading present:
  - `Webtoon panel quick actions (P1)`
- gate placeholder absent:
  - `gateCount = 0`
  - `htmlHasGate = false`
- all 5 actions present in DOM:
  - Add
  - Duplicate
  - Split
  - Merge
  - Reorder

Direct-click runtime evidence
1. Add
- `POST /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel`
- status `200`
- created panel `dea7010a-3d98-4e88-b3a1-0b0e2e483a4b`

2. Duplicate
- `POST /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel`
- status `200`
- created panel `8ec6bd79-8ac1-47d4-8871-de752c777814`

3. Split
- `DELETE /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel?panelId=8ec6bd79-8ac1-47d4-8871-de752c777814`
- followed by 2x `POST /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel`
- status `200`
- created panels:
  - `7b77941e-4111-4ff1-87d2-b0459dd09d28` (`新镜头描述 (Part 1)`)
  - `b6a2b4fe-d1cd-431e-a6e2-e08e34993897` (`新镜头描述 (Part 2)`)

4. Merge
- `DELETE` split panel A
- `DELETE` split panel B
- `POST /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel`
- status `200`
- created panel `cb774037-dc72-4286-9ae1-7121735bbb70`
- merged description: `新镜头描述 (Part 1) → 新镜头描述 (Part 2)`

5. Reorder
- `DELETE /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel?panelId=a3c4b504-4675-4062-8621-1df5823658b9`
- `POST /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel`
- status `200`
- created panel `b46b5881-34d4-43c2-a37e-799ec3b41aec`

Honesty note
- The viewport text snippet itself did not show a dramatic visible text delta after each click because the captured body-text slice was truncated and did not expose the storyboard list cleanly.
- The stronger evidence is the runtime mutation trace itself: correct signed-in page, correct action bar render, direct-click on real buttons, expected backend endpoints, `200` responses, and concrete panel IDs/descriptions returned.

Artifacts
- `docs/testing/vat-133-direct-click-signed-in-runtime-evidence-2026-03-14.md`
- `docs/testing/artifacts/vat-133-direct-click-signed-in-2026-03-14/runtime-summary.json`

Verdict
- VAT-133 signed-in runtime blocker resolved.
- Runtime evidence now supports closure/readiness for VAT-133, subject to project workflow policy.
