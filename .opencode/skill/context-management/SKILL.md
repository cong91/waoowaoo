---
name: context-management
description: Unified protocol for context health and session lifecycle management using DCP tools, thresholds, handoff, and resume workflows
version: 2.0.0
tags: [context, workflow, session]
dependencies: []
---

# Context Management

> **Replaces** manual context tracking and ad-hoc session management — unified protocol for context health across a session lifecycle

Use this skill to keep context useful from first turn to final handoff.

## When to Use

- Context size is growing and you need to reduce noise without losing critical details
- You are finishing a work phase and want to compress completed exploration/implementation
- You are preparing `/handoff` or resuming a prior session
- You need to recover relevant prior context with `find_sessions`, `read_session`, and memory files

## When NOT to Use

- You are actively editing files whose raw content must remain exact
- You are in a short, single-step task that will finish before context pressure appears

## Core Principle

Prefer **phase-level compression** over reactive cleanup.

```text
compress > sweep > handoff
```

- **compress**: Best default when a phase is complete
- **sweep**: Use `/dcp sweep` to clean stale/noisy content after completion
- **handoff**: Use when context pressure remains high even after compression

## DCP Command Usage

### `/dcp compress`

Use for completed chapters of work (research, implementation wave, review sweep).

- Best for large ranges of now-stable outputs
- Lowest cognitive overhead on later turns
- Usually lowest risk of deleting needed details

### `/dcp sweep`

Use after a phase is complete to let DCP remove stale/noisy content automatically.

Good candidates for sweep-driven cleanup:

- wrong-target searches
- failed dead-end exploration no longer needed
- duplicate or superseded junk output

Do **not** sweep because output is merely "long". Length alone is not noise.

## Session Lifecycle Protocol

### 1) Start Session

1. Load task spec and essential policy docs only
2. Check context health (`/dcp context`)
3. Pull prior work only if needed:
   - `find_sessions({ query })`
   - `read_session({ session_id, focus })`
   - `memory-read({ file })` or `memory-search({ query })`

### 2) During Active Work

- Keep active files readable until edits are done
- At each natural boundary, evaluate compress candidates
- Compress completed phases before starting the next chapter

### 3) Pre-Handoff / Closeout

1. Compress completed phase ranges
2. Persist key decisions/learnings to memory (observation or memory-update)
3. Create concise handoff summary (what changed, what is pending, known risks)

### 4) Resume Session

1. Rehydrate only relevant context (don’t replay everything)
2. Validate assumptions against current files/git state
3. Continue with fresh context budget, not accumulated clutter

## Context Budget Thresholds

Use these thresholds as operational triggers:

| Threshold | Interpretation | Required Action |
| --- | --- | --- |
| <50k | Healthy start | Keep inputs minimal, avoid unnecessary reads |
| 50k–100k | Moderate growth | Compress completed phases, keep active files intact |
| >100k | High pressure | Aggressively compress by phase; run `/dcp sweep` on stale noise |
| >150k | Near capacity | Perform handoff and resume in a fresh session |

Secondary guardrails:

- ~70%: Consolidate and drop stale exploration
- ~85%: Plan handoff window at next natural break
- ~95%: Immediate cleanup or restart required

## Phase Boundary Triggers

Compress at these boundaries:

- Research complete → compress exploration + search outputs
- Implementation wave complete → compress completed read/edit/test cycles
- Review complete → compress raw reviewer outputs, keep synthesized findings
- Before `/handoff` → compress everything non-essential since last checkpoint

Rule: **Completed phases should not remain uncompressed for long.**

## Context Transfer Sources (Cross-Session)

Use in priority order:

1. Memory artifacts (`memory-search`, `memory-read`, observations)
2. Session history (`find_sessions`, `read_session`)
3. Task tracker state (`br show <id>` when applicable)
4. Git evidence (`git diff`, `git log`, test output)

Carry forward decisions and constraints, not every intermediate log.

## Anti-Patterns

| Anti-Pattern | Why It Hurts | Correct Pattern |
| --- | --- | --- |
| Compressing active work areas (losing precision needed for edits) | Removes exact lines needed for safe edits | Keep active file/tool outputs until edit + verification complete |
| Sweeping content you still need | Forces rework and increases error risk | Keep active files/tool outputs until phase is complete |
| Not compressing completed exploration phases | Bloats context and degrades later turns | Compress immediately at phase completion |
| Session handoff without persisting key decisions to memory | Next session loses rationale and constraints | Write observations/memory updates before handoff |

## Verification

Check context health: are completed phases compressed? Are active files still readable?

Before claiming cleanup done, confirm:

- Active edit targets are still present in readable form
- Completed phases are compressed or intentionally kept for active work
- No critical decision exists only in transient tool output
- Handoff includes next actions and blockers

## Quick Playbook

```text
1) Start turn: /dcp context
2) Identify completed phase ranges
3) /dcp compress completed ranges
4) /dcp sweep stale/noisy outputs after phase completion
5) persist key decisions to memory
6) handoff/resume with focused rehydration
```

## See Also

- `memory-system`
- `compaction`
