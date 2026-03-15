# Task 3 — Separate beginner path from advanced controls

## Problem
The manga project page exposes too many controls at once, creating heavy cognitive overload for first-time users.

## Goal
Introduce a progressive disclosure model:
- beginner mode: story input, basic style choice, generate CTA, result
- advanced mode: style lock, chapter continuity, conflict policy, run history, deeper control surfaces

## Why
Current page shows too many decisions before the user completes the core job: turning a short idea into manga panels.

## Acceptance criteria
- beginner path is visible and obvious without scrolling through advanced controls
- advanced controls are collapsed, deferred, or gated behind an explicit advanced affordance
- user can complete the first generation without touching advanced settings
- no loss of advanced functionality for power users
