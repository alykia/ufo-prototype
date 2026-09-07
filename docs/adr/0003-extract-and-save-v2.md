# 0003. Player Extract and save v2

Date: 2026-09-07

## Status

Accepted

## Context

Iteration 001 ended a Session on a 5:00 clock or Suspicion 100%, and persisted Power/Beam under `ufo-greybox-save-v1`. Iteration 002 deletes the clock and the Power/Beam pair. Carrying v1 upgrade numbers into five new systems would invent progress the player never bought.

## Decision

Expeditions end when the player taps EXTRACT (after a short lockout) or Suspicion hits 100%. Session Research is always added to Banked Research. Quota is a success/fail stamp, not a timer.

Persistent data lives at `ufo-greybox-save-v2`. v1 is ignored except `soundOn`.

## Consequences

Old Power/Beam/stage progress is discarded on purpose. Players keep their sound toggle. Debug and delete-progress both target v2 only.
