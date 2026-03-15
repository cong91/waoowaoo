# VAT-133 — signed-in runtime direct-click evidence (2026-03-14)

## Scope
- Ticket: VAT-133
- Goal: close the signed-in runtime blocker by proving the Webtoon quick-action surface renders on real signed-in runtime and each direct-click action mutates backend/runtime for the target project.
- Runtime URL: `http://127.0.0.1:13000`
- Project: `11895b41-c233-49f3-823f-c4d0894c1c20`
- Episode: `9a32f0f4-e57b-488c-9f95-cc1021b29148`
- User context: signed-in runtime for user `sean` (`a7052e55-09ac-4fb8-9db3-967ef25f6999`)

## Runtime/source verification before UI evidence
- Rebuilt image inside Colima VM to bypass mac host Docker socket issue:
  - image: `vat-app:vat133fix`
  - image id: `73716cf9f333`
- Redeployed container on correct network `vat-live-net`:
  - container: `waoowaoo-app`
- Verified source markers inside the running container file `MangaPanelControls.tsx`:
  - `shouldShowQuickActions`
  - `Webtoon panel quick actions (P1)`
  - `data-vat133-quick-actions-gate="hidden"`
- Runtime health checks:
  - `HTTP/1.1 200 OK` for `/vi/workspace`
  - Redis, worker, watchdog all connected and ready in logs

## Signed-in DOM verification
- Opened signed-in project page:
  - `http://127.0.0.1:13000/vi/workspace/11895b41-c233-49f3-823f-c4d0894c1c20?stage=script&quickManga=1&episode=9a32f0f4-e57b-488c-9f95-cc1021b29148`
- Verified quick-action surface renders in DOM:
  - heading present: `Webtoon panel quick actions (P1)`
  - gate placeholder absent:
    - `gateCount = 0`
    - `htmlHasGate = false`
    - `htmlHasHeading = true`
- Verified all 5 action buttons are visible and enabled in the runtime DOM:
  - Add
  - Duplicate
  - Split
  - Merge
  - Reorder

## Direct-click runtime evidence
Instrumentation method:
- Hooked `window.fetch` and `XMLHttpRequest` in page context before clicking.
- For each quick action, captured network mutation evidence after a real button click in the signed-in runtime.

### 1. Add
- Button found and clicked: yes
- Backend mutation observed:
  - `POST /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel`
  - status: `200`
- Created panel:
  - `dea7010a-3d98-4e88-b3a1-0b0e2e483a4b`
  - `panelIndex: 2`
  - `panelNumber: 3`

### 2. Duplicate
- Button found and clicked: yes
- Backend mutation observed:
  - `POST /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel`
  - status: `200`
- Created panel:
  - `8ec6bd79-8ac1-47d4-8871-de752c777814`
  - `panelIndex: 3`
  - `panelNumber: 4`

### 3. Split
- Button found and clicked: yes
- Backend mutations observed:
  - `DELETE /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel?panelId=8ec6bd79-8ac1-47d4-8871-de752c777814`
  - `POST /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel`
  - `POST /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel`
  - statuses: all `200`
- Created split panels:
  - `7b77941e-4111-4ff1-87d2-b0459dd09d28` → `description: "新镜头描述 (Part 1)"`
  - `b6a2b4fe-d1cd-431e-a6e2-e08e34993897` → `description: "新镜头描述 (Part 2)"`

### 4. Merge
- Button found and clicked: yes
- Backend mutations observed:
  - `DELETE /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel?panelId=b6a2b4fe-d1cd-431e-a6e2-e08e34993897`
  - `DELETE /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel?panelId=7b77941e-4111-4ff1-87d2-b0459dd09d28`
  - `POST /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel`
  - statuses: all `200`
- Created merged panel:
  - `cb774037-dc72-4286-9ae1-7121735bbb70`
  - `description: "新镜头描述 (Part 1) → 新镜头描述 (Part 2)"`

### 5. Reorder
- Button found and clicked: yes
- Backend mutations observed:
  - `DELETE /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel?panelId=a3c4b504-4675-4062-8621-1df5823658b9`
  - `POST /api/novel-promotion/11895b41-c233-49f3-823f-c4d0894c1c20/panel`
  - statuses: all `200`
- Created reordered panel:
  - `b46b5881-34d4-43c2-a37e-799ec3b41aec`

## Important honesty note
- The visible viewport text snippet did not show a dramatic text delta after each click because the inspected body-text slice was truncated and did not expose the storyboard list in a human-friendly way.
- However, the strongest evidence here is the runtime mutation trace itself:
  - correct signed-in page
  - correct quick-action surface rendered in DOM
  - direct-click on real buttons
  - expected backend endpoints called
  - `200` responses returned
  - panel objects created/deleted/recreated with concrete IDs and descriptions

## Verdict
- VAT-133 signed-in runtime blocker is resolved.
- Evidence now proves:
  1. source inside the running container is correct
  2. quick-action bar renders on real signed-in runtime
  3. all 5 direct-click actions mutate backend/runtime successfully

## Follow-up administrative action
- Recommended next step: update Jira VAT-133 with this evidence and move ticket according to actual policy/state.
