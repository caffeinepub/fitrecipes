# Fitwise Recipes

## Current State
Backend uses `Map.add` to insert new recipes and a `nextIdStable` counter starting at 9. After multiple upgrades, the counter was silently reset to 9 while `recipesV2` still held recipes with IDs 9, 10, etc., causing `Map.add` to trap on duplicate keys and reject every `createRecipe` call.

## Requested Changes (Diff)

### Add
- `computeNextId()` helper that scans `recipesV2` for the highest existing ID and returns `max(existingMax, nextIdStable)`, guaranteeing no collision on any upgrade.

### Modify
- `postupgrade`: use `computeNextId()` instead of `nextIdStable` directly to set `nextId`.
- `createRecipe`: use `recipesV2.put` (overwrites safely) instead of `recipesV2.add` (traps on duplicate).
- Migration loop in `postupgrade`: also use `put` for safety.

### Remove
- Nothing removed.

## Implementation Plan
1. Update `src/backend/main.mo` with `computeNextId` and switch `add` -> `put`.
2. Deploy.
