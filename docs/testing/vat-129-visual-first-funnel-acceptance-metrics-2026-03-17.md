# VAT-129 Visual-First Funnel Acceptance Metrics

## Scope
This pack defines the first usable rollout metrics for VAT-121 Visual-First create flow.

## Event Schema
Core events now available in workspace create flow:
- `workspace_journey_card_view`
- `workspace_journey_selected`
- `workspace_template_selected`
- `workspace_reference_board_toggled`
- `workspace_recommendation_viewed`
- `workspace_wizard_step_view`
- `workspace_wizard_step_next`
- `workspace_wizard_step_back`
- `workspace_create_started`
- `workspace_project_created`

## Required Dimensions
Each event should carry as many of the following as possible:
- `journeyType`
- `projectMode`
- `entryIntent`
- `templateId`
- `stylePresetId`
- `characterStrategyId`
- `environmentPresetId`
- `promptMode`
- `referenceBoardSelections`
- `wizardStep`
- `surface`
- `locale`
- `projectId` when available

## KPI Mapping
### KPI-1: Visual-first adoption
Formula:
- numerator: sessions with `stylePresetId` present before project creation
- denominator: sessions with `workspace_create_started`

Target:
- >= 80% of created projects carry `stylePresetId`

### KPI-2: Character strategy usage
Formula:
- numerator: sessions with `characterStrategyId` set before create
- denominator: sessions with `workspace_create_started`

Target:
- >= 60%

### KPI-3: Environment preset usage
Formula:
- numerator: sessions with `environmentPresetId` set before create
- denominator: sessions with `workspace_create_started`

Target:
- >= 60%

### KPI-4: Reference board activation
Formula:
- numerator: sessions with at least 1 `workspace_reference_board_toggled`
- denominator: sessions with `workspace_wizard_step_view` at visual-first source step

Target:
- >= 35%

### KPI-5: Prompt-secondary behavior
Formula:
- numerator: created sessions with `promptMode="guided"`
- denominator: all `workspace_project_created`

Target:
- >= 70%

### KPI-6: Recommendation visibility
Formula:
- numerator: sessions with `workspace_recommendation_viewed`
- denominator: sessions that reached wizard visual-first selection step

Target:
- >= 95%

## Rollout Guardrails
### Guardrail-1
If `workspace_project_created` drops >20% after enabling visual-first flow, stop rollout.

### Guardrail-2
If `workspace_wizard_step_back` spikes >30% on step 2 or step 3, review copy and decision density.

### Guardrail-3
If `promptMode="advanced"` exceeds 50% for new users, prompt-secondary UX is probably too weak.

## Verification Checklist
- [ ] Create flow emits `stylePresetId`
- [ ] Create flow emits `characterStrategyId`
- [ ] Create flow emits `environmentPresetId`
- [ ] Create flow emits `promptMode`
- [ ] Create flow emits `referenceBoardSelections`
- [ ] Runtime page reads onboarding context back correctly
- [ ] Reference board edits persist through runtime patch path
- [ ] Recommendation view event fires on visual-first selection step
- [ ] Funnel fields stay stable after project creation

## Current Readiness
Status: foundation ready

Meaning:
- schema and event shape are now sufficient for first-pass rollout measurement
- dashboard / reporting job / aggregation readout still need follow-up implementation
