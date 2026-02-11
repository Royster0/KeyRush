# Banner Customization Implementation Plan (v4)

## Status
- Planning complete.
- No code changes have been made yet.

## Confirmed Product Decisions
- Rank-based unlocks are **permanent** and use **peak rank reached**.
- Banner titles are chosen only from unlocked presets (no free-text titles).
- V1 visuals use CSS/Tailwind/Framer Motion (no image assets yet).
- Each user has **3 banner presets**.
- Banner displays on:
  - Profile pages
  - Friends page (as full mini-card header)
  - Multiplayer ready-up lobby only
- Route name is `/banner`.
- Schema changes should be applied via Supabase tooling and mirrored in a local SQL doc file.
- Existing users should have `peak_rank_tier` backfilled from current `rank_tier`.
- Preset names:
  - Max length: **24** characters
  - Allowed characters: alphanumeric, spaces, `_`, `-`
  - Default names: `Preset 1`, `Preset 2`, `Preset 3`
  - Users can rename presets
- Include a **Tachyon** rank tier (Elo 2100+) and border now.

## Implementation Scope
1. Add Tachyon to `RANK_TIERS` in `src/lib/multiplayer.ts` (min: 2100).
2. Add banner domain model/types.
3. Add DB schema for banner presets + active preset + peak rank tracking.
4. Add server-side banner services/actions with strict validation.
5. Update `calculate_elo_update` Supabase RPC to maintain `peak_rank_tier` atomically.
6. Build private `/banner` customization page.
7. Add nav entry + robots + theme modal path updates.
8. Render active banners in profile, friends, and multiplayer lobby.
9. Verify behavior manually + lint.

## Data Model and Migration

### New Table: `public.banner_presets`
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null` (FK -> `profiles.id` ON DELETE CASCADE, consistent with `friend_presence` convention)
- `slot smallint not null` (values `1`, `2`, `3`)
- `name varchar(24) not null`
- `background_id text not null`
- `border_id text not null`
- `title_id text not null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### Constraints / Indexes
- Unique: `(user_id, slot)`
- Check: `slot between 1 and 3`
- Check: `char_length(name) between 1 and 24`
- Optional check pattern for `name` at DB level: `^[A-Za-z0-9 _-]+$`

### `profiles` Additions
- `active_banner_slot smallint not null default 1` (check 1..3)
- `peak_rank_tier text null`

### Backfill
- `update profiles set peak_rank_tier = rank_tier where peak_rank_tier is null and rank_tier is not null;`

### Preset Initialization (Lazy)
- **No bulk seed migration.** Default presets are created lazily on first access.
- The banner service checks if presets exist for the user; if not, inserts 3 defaults:
  - Names: `Preset 1`, `Preset 2`, `Preset 3`
  - Default components: `bg_starter_fade`, `border_clean`, `title_rookie`
- This handles both existing users and future signups with no migration or signup-flow changes.
- The insert uses `ON CONFLICT (user_id, slot) DO NOTHING` for idempotency.

### RLS Policies
- Enable RLS on `banner_presets`.
- **Owner mutation policies:**
  - `select` own rows
  - `insert` own rows
  - `update` own rows
  - No `delete` policy — presets are fixed-slot and always present.
- **Public read policy (active preset only):**
  - Any authenticated user can `select` another user's banner preset row where `slot` matches that user's `profiles.active_banner_slot`. This enables rendering banners on profile pages, friends list, and multiplayer lobby.
  - Implementation: `USING (user_id = auth.uid() OR slot = (SELECT active_banner_slot FROM profiles WHERE id = banner_presets.user_id))`

### `updated_at` Trigger
- Add a `moddatetime` trigger on `banner_presets` to auto-update `updated_at` on row changes.
- Alternatively, set `updated_at = now()` explicitly in the service layer UPDATE queries.

### Existing SELECT Query Updates
The following queries read from `profiles` with explicit column lists and must be updated to include `active_banner_slot` and/or `peak_rank_tier` where needed:
- `src/lib/services/user.ts` → `getUser()` — add `active_banner_slot`, `peak_rank_tier`
- `src/lib/services/user.ts` → `getProfileByUsername()` — add `active_banner_slot`, `peak_rank_tier`
- `src/lib/services/friends.ts` → friend request/friendship joins on profiles — add `active_banner_slot` for banner rendering on friends page
- `src/types/auth.types.ts` → `UserWithProfile` profile shape — add optional fields

### Migration Artifacts
- Apply through Supabase tooling.
- Mirror SQL into local docs file, e.g. `docs/sql/banner_customization_v1.sql`.

## App-Level Domain Design

### New Type File
- `src/types/banner.types.ts`
- Define:
  - `BannerComponentType = "background" | "border" | "title"` (the three component categories)
  - `PresetSlot = 1 | 2 | 3` (the three preset slots)
  - `UnlockRequirement` union (`badge`, `peak_rank`, `default`)
    - **Note:** No `level` variant. Level-based unlocks use the corresponding badge (e.g. `level_5` badge). Single source of truth.
  - `BannerComponentDefinition`
  - `BannerPreset`
  - `ResolvedBannerPreset` / `UnlockedBannerState`

### New Config File
- `src/lib/banners.ts`
- Contains:
  - Component catalog (all backgrounds, borders, titles with their IDs and unlock requirements)
  - Unlock resolution logic: checks `user_badges` for badge-based unlocks, `peak_rank_tier` for rank-based unlocks
  - Rank order constant: `["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Sonic", "Mach", "Tachyon"]`
  - `isRankAtLeast(userPeakRank, requiredRank)` helper for rank comparisons
  - `getUnlockedComponents(userBadges, peakRankTier)` returns set of unlocked component IDs
  - Default preset constants for lazy initialization

## Starter Catalog / Unlock Mapping (V1)

### Backgrounds
- `bg_starter_fade` (default)
- `bg_arcade_grid` (`level_5` badge)
- `bg_neon_drift` (`first_multiplayer` badge)
- `bg_velocity_lines` (`wpm_100` badge)
- `bg_precision_wave` (`perfect_accuracy` badge)
- `bg_grindstone` (`tests_100` badge)
- `bg_elite_pulse` (`leaderboard_top_10` badge)
- `bg_champion_aura` (`leaderboard_first` badge)
- `bg_mach_burst` (peak rank `Mach`)

### Borders
- `border_clean` (default)
- `border_victor` (`first_win` badge)
- `border_unstoppable` (`win_streak_5` badge)
- `border_bronze` (peak rank `Bronze`)
- `border_silver` (peak rank `Silver`)
- `border_gold` (peak rank `Gold`)
- `border_platinum` (peak rank `Platinum`)
- `border_diamond` (peak rank `Diamond`)
- `border_sonic` (peak rank `Sonic`)
- `border_mach` (peak rank `Mach`)
- `border_tachyon` (peak rank `Tachyon`)

### Titles
- `title_rookie` (default)
- `title_slowpoke` (default)
- `title_challenger` (`first_multiplayer` badge)
- `title_speedster` (`wpm_100` badge)
- `title_lightning_fingers` (`wpm_150` badge)
- `title_perfectionist` (`perfect_accuracy` badge)
- `title_rising_star` (`level_5` badge)
- `title_dedicated` (`level_10` badge)
- `title_veteran` (`level_20` badge)
- `title_legend` (`level_50` badge)
- `title_victor` (`first_win` badge)
- `title_unstoppable` (`win_streak_5` badge)
- `title_elite` (`leaderboard_top_10` badge)
- `title_champion` (`leaderboard_first` badge)

## Service and Action Layer

### New Service
- `src/lib/services/banners.ts`
- Responsibilities:
  - Load user presets and active slot (with lazy initialization if presets don't exist)
  - Resolve unlocked components from:
    - `user_badges` (covers both badge-based and level-based unlocks — level unlocks use their corresponding badge)
    - `profiles.peak_rank_tier`
  - Validate and persist preset updates
  - Validate and set active preset
  - Rename preset with server-side sanitization
- **New Zod schema file:** `src/lib/schemas/banners.ts`
  - `BannerPresetRowSchema` for DB response validation
  - `mapDbBannerPresetToModel()` mapping function
  - Follow existing pattern from `src/lib/schemas/badges.ts`

### `src/app/actions.ts`
- Add actions for:
  - `getBannerCustomizationState()` — loads own presets, active slot, and resolved unlock state
  - `getActiveBanner(userId)` — loads another user's active preset for display (profile/friends/lobby)
  - `updateBannerPreset(...)` — equip components to a preset slot
  - `setActiveBannerPreset(slot)` — change which preset is active
  - `renameBannerPreset(slot, name)` — rename a preset with validation

## Peak Rank Tracking Logic
- **Primary change:** Modify the `calculate_elo_update` Supabase RPC to atomically compare and update `profiles.peak_rank_tier` alongside the Elo/rank update. This keeps the logic server-side and avoids race conditions.
  - The RPC already writes `rank_tier` — add logic: if new `rank_tier` is higher than current `peak_rank_tier` (or peak is null), set `peak_rank_tier = rank_tier`.
  - Rank order for comparison: Bronze < Silver < Gold < Platinum < Diamond < Sonic < Mach < Tachyon.
  - Return `peak_rank_tier` in the RPC result alongside existing fields.
- **TypeScript side:** Update `EloUpdateResult` type in `src/app/api/multiplayer/complete/route.ts` to include `peak_rank_tier: string`.
- Add `Tachyon` (min: 2100) to `RANK_TIERS` in `src/lib/multiplayer.ts`.
- Unlock checks always use `peak_rank_tier` (never current rank alone).

## UI Implementation

### New Route
- `src/app/banner/page.tsx`
- Private route behavior like `/badges` (redirect unauthenticated users).
- Metadata via `buildMetadata({ ..., path: "/banner", noIndex: true })`.

### New Client Component
- `src/components/banner/BannerClient.tsx`
- Features:
  - Tabs/segmented control for presets 1/2/3
  - Editable preset name (validated to 24 chars + safe charset)
  - Visual preview using CSS/Tailwind/Framer Motion
  - Component pickers for background/border/title
  - Locked states with explicit requirement labels
  - Save/apply and active preset selection

### Nav + Robots
- Update `src/components/ui/Nav.tsx`:
  - Add `Banner` in desktop hover menu (between Badges and Match History)
  - Add `Banner` in mobile sheet menu (between Badges and Match History)
  - Add `/banner` to the `showThemeModal` path list (currently: `/multiplayer`, `/leaderboard`, `/about`, `/profile`, `/badges`, `/u`)
- Update `src/app/robots.ts` disallow list to include `/banner`.

## Banner Rendering Targets

### Profile Pages
- `src/components/profile/ProfileOverview.tsx`
- `src/app/profile/page.tsx`
- `src/app/u/[username]/page.tsx`
- Render active preset banner and title in profile header region.

### Friends Page
- Add active banner data to friend fetch pipeline and render as full mini-card header.

### Multiplayer
- Show banner in ready-up lobby UI only (not queue/results unless changed later).

## Validation and Security Rules
- All equip/rename operations are server-validated.
- Preset name rules:
  - Trim whitespace
  - Length `1..24`
  - Charset `^[A-Za-z0-9 _-]+$`
- Reject unknown component IDs.
- Reject locked component IDs.
- Ensure users can only mutate their own presets.

## Testing / Verification Plan
- Run `npm run lint`.
- Run `npx tsc --noEmit` (main codebase) and `npx tsc -p tsconfig.party.json --noEmit` (PartyKit).
- Manual checks:
  - Default presets are lazily created on first `/banner` visit for new and existing users
  - Rename validation (length + charset) rejects invalid names
  - Lock states display correctly with requirement labels
  - Unlock progression works for badge-based and peak-rank paths
  - Deranking does not remove rank unlocks (peak_rank_tier is monotonically increasing)
  - Active preset persists and renders correctly on:
    - own profile page (`/profile`)
    - public profile page (`/u/[username]`)
    - friends page headers
    - multiplayer ready-up lobby
  - Other users can only see your active preset, not all 3
  - Unauthorized mutation attempts fail (equipping locked components, editing others' presets)
  - Tachyon rank tier is reachable at Elo 2100+

## Acceptance Criteria
- Users can manage 3 presets, rename them, and set an active preset.
- Unlock system is enforced server-side and resolves from `user_badges` + `peak_rank_tier`.
- Level-based unlocks use their corresponding badge (e.g. `level_5`).
- Rank unlocks are permanent via `peak_rank_tier`, updated atomically in the `calculate_elo_update` RPC.
- Tachyon is a real rank tier (Elo 2100+) with a corresponding border.
- Banner active preset is visible to other users on profile/friends/lobby surfaces.
- Non-active presets are private (RLS enforced).
- `/banner` is private and `noindex`.
- Migration is applied in Supabase and mirrored in local docs SQL file.
- Lazy preset initialization works correctly — no bulk seed migration needed.
