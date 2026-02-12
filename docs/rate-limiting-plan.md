# KeyRush Rate Limiting Plan

## 1. Goal

Add rate limiting to prevent abuse, reduce cost risk, and protect competitive integrity without blocking normal player behavior.

## 2. Why This Is Needed

Current high-risk write paths are callable without throttling:
- `POST /api/multiplayer/complete`
- Server actions used for `saveTestResult`, `awardXp`, `checkAndAwardBadges`, friend mutations, and banner customization
- Auth and username creation actions (`login`, `signup`, `signInWithGoogle`, `createUsername`)

Read-heavy endpoints can also be scraped/hammered:
- `GET /api/leaderboard`
- `GET /api/leaderboard/ranked`
- `GET /api/get-user`

PartyKit messages are currently unthrottled per connection (`progress`, `finish`, `queue-join`, etc.).

## 3. Scope

In scope:
- Central limiter utility for Next.js route handlers and server actions
- Policy-based per-endpoint limits
- PartyKit message-rate guards
- Appropriate rate-limit responses per surface (see Section 5a)
- Logging + rollout tuning

Out of scope for this pass:
- Full anti-cheat redesign
- Full DB schema redesign for abuse analytics
- Direct client-side Supabase writes (`friend_presence` heartbeat). This table is RLS-constrained to the authenticated user's own row and fires at low frequency (~1/min + tab focus). Rely on RLS + Supabase's built-in connection limits; add a server action wrapper only if abuse appears in logs.

## 4. Architecture Decision

Recommended backend: Upstash Redis via `@upstash/ratelimit` + `@upstash/redis`.

Why:
- Works in serverless/edge environments
- Shared counters across instances
- Fast to integrate

Algorithm choices:
- **Sliding window** (`Ratelimit.slidingWindow()`) for all HTTP policies (middleware, route handlers, server actions). Good burst protection with only 2 Redis calls per check.
- **Token bucket** (`Ratelimit.tokenBucket()`) for PartyKit message throttling. Natural fit for message-rate limiting where short bursts are acceptable but sustained abuse is not.

Client configuration:
- Enable `ephemeralCache` (in-memory map) to avoid redundant Redis round-trips for already-blocked identifiers. This is a free performance optimization.
- Set `prefix: "keyrush:rl"` to namespace all rate-limit keys, avoiding collisions if the Redis instance is shared.
- Enable `analytics: true` for Upstash's built-in usage dashboard (used in Phase 6).

Fallback behavior:
- In development, allow an in-memory limiter or no-op mode behind config
- In production, handle limiter errors with explicit `try/catch` wrappers per policy class:
  - **Write endpoints** (auth, game completion, XP, friend mutations): fail closed (block the request if the limiter is unreachable)
  - **Read endpoints** (leaderboard, get-user): fail open (allow the request if the limiter is unreachable)
  - Implementation: set `timeout: 3000` on the Ratelimit client. On timeout/error, check the policy class and branch accordingly.

## 5. Policy Matrix (Initial Values)

| Surface | Key | Limit | Window | Action |
|---|---|---:|---|---|
| **Global (all routes)** | `ip` | 300 | 1 min | block |
| `POST /api/multiplayer/complete` | `userId` + `ip` | 10 | 1 min | block |
| `saveTestResult` action | `userId` + `ip` | 15 | 1 min | block |
| `awardXp` action | `userId` | 15 | 1 min | block |
| `checkAndAwardBadges` action | `userId` | 15 | 1 min | block |
| `sendFriendRequest` action | `userId` | 10 | 1 hour | block |
| `respondToFriendRequest` action | `userId` | 20 | 1 hour | block |
| `removeFriend` action | `userId` | 15 | 1 hour | block |
| `updateBannerPreset` action | `userId` | 10 | 1 min | block |
| `setActiveBannerPreset` action | `userId` | 10 | 1 min | block |
| `renameBannerPreset` action | `userId` | 10 | 1 min | block |
| `login` action | `ip` + normalized email | 10 | 10 min | block |
| `signup` action | `ip` + normalized email | 5 | 1 hour | block |
| `signInWithGoogle` action | `ip` | 10 | 10 min | block |
| `createUsername` action | `userId` + `ip` | 5 | 1 hour | block |
| `GET /api/leaderboard` | `ip` | 120 | 1 min | block + cache |
| `GET /api/leaderboard/ranked` | `ip` | 120 | 1 min | block + cache |
| `GET /api/get-user` | `ip` | 120 | 1 min | block |

Notes:
- Start conservative and tune from logs.
- If false positives occur, raise read limits first, then write limits.
- `saveTestResult` reduced from 24 to 15: shortest test is 5s, so ~12/min is the physical max. 15 gives headroom without being exploitable.
- `/api/get-user` is client-triggered on auth/path changes (not interval polling), so 120/min leaves substantial headroom for normal navigation.
- `GET /api/favicon` has no dedicated per-route policy for now. It is a dynamic SVG endpoint (`color` query param) but returns long-lived cache headers; rely on the global limit first and add a route policy only if abuse appears in logs.
- `signInWithGoogle` is keyed by IP only (no email) because it's an OAuth redirect flow — the user doesn't submit credentials directly, so credential-stuffing isn't a vector. IP-only catches automated abuse from a single source.
- `awardXp` and `checkAndAwardBadges` are rate-limited independently even though they're normally called as side effects of `saveTestResult` / `multiplayer/complete`, because they are exported `"use server"` functions that a malicious client can import and call directly. Consider collapsing these into a single "complete test" composite action in a future refactor.
- Banner actions (`updateBannerPreset`, `setActiveBannerPreset`, `renameBannerPreset`) are low-frequency by nature but still need limits to prevent automated abuse.

### 5a. Response Contracts by Surface

Rate limiting applies to three different surfaces that require different response contracts:

**Route handlers** (`/api/*`):
- Return HTTP 429 status with JSON body: `{ error: "Too many requests" }`
- Include headers: `Retry-After` (seconds), `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` (draft IETF standard), plus `X-RateLimit-*` equivalents for older client compatibility.

**Middleware** (global IP limit):
- Return HTTP 429 via `NextResponse` with the same headers as route handlers.

**Server actions**:
- Server actions return JS values, not HTTP responses. They cannot return a 429 status code.
- Return a typed error object: `{ code: "RATE_LIMITED", retryAfterMs: number }`
- Callers (e.g., `Game.tsx`, `FriendsClient.tsx`) must check for this code and display an appropriate message (e.g., toast notification).
- `enforce.ts` should export a shared helper that returns the typed error shape for consistent use across all server actions.

## 6. Implementation Plan

### Phase 0: Prerequisites

1. Add dependencies:
- `@upstash/ratelimit`
- `@upstash/redis`

2. Add env vars:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RATE_LIMIT_ENABLED=true` (set to `false` to disable all rate limiting, e.g. in local dev)
- `RATE_LIMIT_MODE=enforce` (values: `report` or `enforce`; default `enforce` in production)

### Phase 1: Shared Limiter Library

Create:
- `src/lib/rate-limit/policies.ts`
- `src/lib/rate-limit/client.ts`
- `src/lib/rate-limit/identity.ts`
- `src/lib/rate-limit/enforce.ts`
- `src/lib/rate-limit/response.ts`

Responsibilities:
- Define named policies with algorithm, limits, and policy class (write vs read)
- Instantiate `Ratelimit` with `ephemeralCache`, `prefix: "keyrush:rl"`, and `analytics: true`
- Compute stable keys (`user:{id}`, `ip:{addr}`, `email:{sha256-truncated}`) — hash emails with SHA-256 (truncated to 16 chars) to avoid storing raw PII in Redis
- Enforce limit and return `{ allowed, remaining, reset }`
- On limiter error/timeout: fail closed for write policies, fail open for read policies
- Support report mode: always call `ratelimit.limit()` and log, but only block when `RATE_LIMIT_MODE=enforce`
- Build standardized 429 JSON responses and headers (`Retry-After`, `RateLimit-*`, `X-RateLimit-*`) for route handlers
- Export typed error helper `rateLimitedError(retryAfterMs)` returning `{ code: "RATE_LIMITED", retryAfterMs }` for server actions

### Phase 2: Route Handlers

Apply global IP-based rate limit in Next.js middleware (`middleware.ts`) as a first line of defense against broad abuse/scanning. **Critical: the rate limit check must run as the very first operation in `middleware()`, before the existing `sb-` cookie short-circuit** (the check at line 6 that skips auth refresh for requests with no Supabase session cookies). This ensures all traffic — including unauthenticated requests from bots/scrapers — is covered by the global limit.

Then apply per-route limiter checks to:
- `src/app/api/multiplayer/complete/route.ts`
- `src/app/api/leaderboard/route.ts`
- `src/app/api/leaderboard/ranked/route.ts`
- `src/app/api/get-user/route.ts`

Also add cache headers to leaderboard routes: `Cache-Control: public, s-maxage=30, stale-while-revalidate=60`. Leaderboard data updates infrequently and the 30s server-cache TTL aligns with typical refresh patterns.

### Phase 3: Server Actions

Add checks in:
- `src/app/auth/login/actions.ts` (`login`, `signup`, `signInWithGoogle`)
- `src/app/auth/create-username/username-actions.ts` (`createUsername`)
- `src/app/actions.ts` wrappers for:
  - `saveTestResult`
  - `awardXp`
  - `checkAndAwardBadges`
  - `sendFriendRequest`
  - `respondToFriendRequest`
  - `removeFriend`
  - `updateBannerPreset`
  - `setActiveBannerPreset`
  - `renameBannerPreset`

Server actions return the typed `{ code: "RATE_LIMITED", retryAfterMs }` error shape (not HTTP 429).

### Phase 4: PartyKit Message Throttling

In `party/server.ts`, add per-connection token buckets keyed by **`connection.id`** (server-assigned, not spoofable), not by client-supplied `userId`:

**Client-side prerequisite**: The current client emits `progress` messages from two overlapping sources — a 100ms `setInterval` (10/sec) and a `useEffect` on `typed.length` changes (fires on every keystroke). For a fast typist at 150 WPM, this produces ~22.5 messages/sec combined, and can exceed 25/sec at higher speeds. **Before enforcing server-side limits, remove the `typed.length` effect and rely solely on the 100ms interval**, which is sufficient for smooth opponent progress display. This reduces the legitimate ceiling to a predictable 10 messages/sec.

After the client-side fix, apply per-connection token buckets:
- `progress`: max 15 messages/second (headroom above the 10/sec interval)
- `ready`, `finish`, `leave`: max 5 per 10 seconds
- `queue-join`, `match-join`: max 6 per minute

Behavior:
- Ignore excess messages first
- Disconnect repeat offenders after threshold breaches

Security note: The PartyKit server currently trusts `payload.userId` from the client without verification. This is a separate identity-spoofing gap that should be addressed as a follow-up (e.g., by verifying the Supabase auth token on WebSocket connection). For this rate-limiting pass, keying throttles by `connection.id` ensures the limits can't be bypassed by spoofing a different userId.

### Phase 5: Idempotency Hardening (Critical Companion to Rate Limiting)

Rate limiting alone does not stop replay abuse. Add one-time processing semantics for match completion + XP/Elo award:
- Ensure a match result for `(match_id, user_id)` is processed exactly once
- If duplicate submission arrives, return prior result without re-awarding XP/Elo

Preferred approach:
- Add a `processed` boolean column (default `false`) to `match_results`.
- Create a single Supabase RPC function that atomically: acquires a row-level lock (`SELECT ... FOR UPDATE`), checks the `processed` flag, performs XP award + Elo update only if `processed = false`, then sets `processed = true`.
- **This must be a single DB transaction with row-level locking**, not an application-level check-then-award pattern. The current code has a race window: two concurrent requests can both pass the upsert (or a flag check) before either commits, resulting in double XP/Elo awards.
- The unique constraint on `(match_id, user_id)` in `match_results` already prevents duplicate row inserts, but the side effects (XP/Elo) need this transactional guard since they're separate operations today.

### Phase 6: Observability

Add structured logs on every rate-limited request (whether blocked or report-only):
- `policy`, `keyType`, `route/action`, `userId?`, `ipHash`, `remaining`, `reset`, `mode` (report vs enforce)

Leverage Upstash's built-in analytics (`analytics: true` on the client) as the starting point for weekly review metrics:
- Top blocked routes
- Unique blocked identities
- Error/false-positive reports

### Phase 7: Rollout

1. Report-only mode (24-72h): call `ratelimit.limit()` on every request and log overages, but do not block. Implementation: check `RATE_LIMIT_MODE === "report"` after the limit call — if over limit, log and continue instead of returning 429/error.
2. Enforce on write paths.
3. Enforce on read paths.
4. Tune thresholds based on logs and Upstash analytics dashboard.

## 7. Acceptance Criteria

- Route handlers return HTTP 429 with `Retry-After`, `RateLimit-*`, and `X-RateLimit-*` headers once limits are exceeded.
- Server actions return `{ code: "RATE_LIMITED", retryAfterMs }` once limits are exceeded.
- PartyKit drops/disconnects abusive message rates (keyed by connection.id).
- No observed impact to normal play loops (singleplayer, multiplayer, friends, auth, banner customization).
- Duplicate completion attempts do not award XP/Elo more than once (DB-atomic guard).
- Report-only mode logs overages without blocking.
- Limiter errors fail closed for write policies and fail open for read policies.

## 8. Risks and Mitigations

- Risk: false positives for fast legitimate users.
  - Mitigation: report-only rollout, per-policy tuning.

- Risk: limiter backend outage.
  - Mitigation: explicit fail-closed/fail-open behavior per policy class (writes block, reads pass through). `timeout: 3000` on Ratelimit client prevents hung requests.

- Risk: IP-only keys penalize shared networks.
  - Mitigation: prefer authenticated `userId` key when available; keep IP as secondary control.

- Risk: PartyKit progress throttle too aggressive for fast typists.
  - Mitigation: reduce client emit frequency first (remove `typed.length` effect, keep 100ms interval only), then set server threshold with headroom (15/sec vs 10/sec actual).

- Risk: race condition in match completion allows double XP/Elo award.
  - Mitigation: single Supabase RPC with `SELECT ... FOR UPDATE` + `processed` flag, ensuring atomicity at the DB level.

## 9. Estimated Execution Order

1. Build shared limiter library (with `ephemeralCache`, `prefix`, algorithm choices, report/enforce mode, fail-open/closed wrappers).
2. Protect `multiplayer/complete` and auth actions.
3. Protect singleplayer/friend/banner server actions.
4. Reduce PartyKit client emit frequency, then add server-side throttling.
5. Add idempotency guard for match completion side effects (DB-atomic RPC).
6. Roll out with report-only monitoring and tune.
