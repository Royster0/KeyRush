# Banner Customization Implementation Plan (v3)

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
- Include a **Tachyon** rank border now for future progression.

## Implementation Scope
1. Add banner domain model/types.
2. Add DB schema for banner presets + active preset + peak rank tracking.
3. Add server-side banner services/actions with strict validation.
4. Keep `peak_rank_tier` updated from ranked progression events.
5. Build private `/banner` customization page.
6. Add nav entry + robots updates.
7. Render active banners in profile, friends, and multiplayer lobby.
8. Verify behavior manually + lint.

## Data Model and Migration

### New Table: `public.banner_presets`
- `id uuid primary key default gen_random_uuid()`
- `user_id uuid not null` (FK -> `profiles.id` or `auth.users.id`, consistent with existing app conventions)
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

### Seed Defaults
- Insert 3 default preset rows per existing user (`slot` 1..3) with:
  - Names: `Preset 1`, `Preset 2`, `Preset 3`
  - Default components: `bg_starter_fade`, `border_clean`, `title_rookie`

### RLS Policies
- Enable RLS on `banner_presets`.
- Owner-only access policies:
  - `select` own rows
  - `insert` own rows
  - `update` own rows
  - (optional) disallow delete in v1 unless explicitly needed

### Migration Artifacts
- Apply through Supabase tooling.
- Mirror SQL into local docs file, e.g. `docs/sql/banner_customization_v1.sql`.

## App-Level Domain Design

### New Type File
- `src/types/banner.types.ts`
- Define:
  - `BannerSlot = "background" | "border" | "title"`
  - `BannerComponentType = "background" | "border" | "title"`
  - `UnlockRequirement` union (`badge`, `level`, `peak_rank`, `default`)
  - `BannerComponentDefinition`
  - `BannerPreset`
  - `ResolvedBannerPreset` / `UnlockedBannerState`

### New Config File
- `src/lib/banners.ts`
- Contains:
  - Component catalog
  - Unlock mappings
  - Rank order constants including `Tachyon`
  - Utility helpers for unlock checks / rank comparisons

## Starter Catalog / Unlock Mapping (V1)

### Backgrounds
- `bg_starter_fade` (default)
- `bg_arcade_grid` (level 5)
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
  - Load user presets and active slot
  - Resolve unlocked components from:
    - `user_badges`
    - `profiles.level`
    - `profiles.peak_rank_tier`
  - Validate and persist preset updates
  - Validate and set active preset
  - Rename preset with server-side sanitization

### `src/app/actions.ts`
- Add actions for:
  - `getBannerCustomizationState()`
  - `updateBannerPreset(...)`
  - `setActiveBannerPreset(slot)`
  - `renameBannerPreset(slot, name)`

## Peak Rank Tracking Logic
- Update ranked completion path (`src/app/api/multiplayer/complete/route.ts`) to maintain `profiles.peak_rank_tier`.
- Use rank-order comparison helper (including `Tachyon`) and only update when new rank is higher than stored peak.
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
  - Add `Banner` in desktop hover menu
  - Add `Banner` in mobile sheet menu
  - Include `/banner` in theme modal path list if needed
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
- Manual checks:
  - Default presets exist for new/existing users
  - Rename validation (length + charset)
  - Lock states display correctly
  - Unlock progression works for badge/level/peak-rank paths
  - Deranking does not remove rank unlocks
  - Active preset persists and renders correctly on:
    - profile pages
    - friends page headers
    - multiplayer ready-up lobby
  - Unauthorized mutation attempts fail

## Acceptance Criteria
- Users can manage 3 presets, rename them, and set an active preset.
- Unlock system is enforced server-side and reflects badge/level/peak-rank state.
- Rank unlocks are permanent via `peak_rank_tier`.
- Banner appears in all requested surfaces.
- `/banner` is private and `noindex`.
- Migration is applied in Supabase and mirrored in local docs SQL file.
