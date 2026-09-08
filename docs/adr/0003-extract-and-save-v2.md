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

## Amended 2026-09-07

Quota completion now ends the Expedition immediately as a success and banks Session Research. Extract remains the player-chosen early end (quota missed = failed). Suspicion 100% remains the forced end. The save key stays `ufo-greybox-save-v2`; Onboarding state is added to it with defaults, not a new key.

## Amended 2026-09-08

Correction to the Decision above: Session Research is banked **only** when the Expedition succeeds (Quota met). Failed (early Extract) and detected (Suspicion 100%) Expeditions bank nothing; this is what `endExpedition` has done since iteration 002 and the glossary now says the same. Meteorite (ADR 0004) is the exception: it is paid the moment a goal completes and survives failure. Save v2 also gains `meteorite` and `cosmetics` with defaults, same pattern as `onboarding`.
