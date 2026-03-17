# VAT-121 Visual-First Runtime Verification Pack

## Objective
Verify that the Visual-First onboarding flow is no longer wizard-only and that runtime surfaces preserve the same intent.

## End-to-End Flow Under Test
1. User opens create project modal
2. User selects journey
3. User selects style preset
4. User selects character strategy
5. User selects environment preset
6. User selects reference board anchors
7. User keeps prompt mode in guided or explicitly switches to advanced
8. Project is created
9. Runtime page reads onboarding context back
10. Runtime page allows reference board updates
11. Prompt stage shows advanced/guided framing instead of appearing context-free

## Evidence Checklist
- [ ] Create wizard step 2 shows visual-first style gallery
- [ ] Create wizard step 2 shows character strategy selector
- [ ] Create wizard step 2 shows environment gallery
- [ ] Create wizard step 2 shows recommendation summary
- [ ] Create wizard step 3 shows reference board shell
- [ ] Create wizard step 3 shows prompt depth control
- [ ] Create payload persists visual-first selections
- [ ] Backend stores onboarding context fields end-to-end
- [ ] Runtime page renders visual-first summary card
- [ ] Runtime page renders reference board runtime panel
- [ ] Runtime reference board edits persist after refresh
- [ ] Prompt stage shows prompt-depth framing banner
- [ ] Stage label reflects guided vs advanced prompt mode

## Required Data Fields
- `stylePresetId`
- `characterStrategyId`
- `environmentPresetId`
- `promptMode`
- `referenceBoardSelections`
- `journeyType`
- `entryIntent`
- `sourceType`

## Runtime Assertions
### Assertion A
If a project is created with `promptMode="guided"`, the prompt stage must show guided framing copy and should not appear as the primary entry choice.

### Assertion B
If runtime reference board order is changed, the next project data fetch must reflect the new order.

### Assertion C
If a project was created through Visual-First flow, runtime summary must show the same style/character/environment decisions.

## Known Current Gaps
- Reference board is list-based, not full drag-drop canvas
- Compare preset view is still light-weight, not a dedicated comparison workspace
- Analytics pack exists, but no dashboard readout is included in this slice

## Current Status
Status: usable integration checkpoint

Interpretation:
- create flow, persistence, runtime read-back, and runtime context framing are all present
- deeper UX polish and reporting infrastructure remain follow-up items
