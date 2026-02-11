# KeyRush Rate Limiting Plan

## 1. Goal

Add rate limiting to prevent abuse, reduce cost risk, and protect competitive integrity without blocking normal player behavior.

## 2. Why This Is Needed

Current high-risk write paths are callable without throttling:
- `POST /api/multiplayer/complete`
- Server actions used for `saveTestResult`, `awardXp`, `checkAndAwardBadges`, and friend mutations
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
- 429 responses with retry metadata
- Logging + rollout tuning

Out of scope for this pass:
- Full anti-cheat redesign
- Full DB schema redesign for abuse analytics

## 4. Architecture Decision

Recommended backend: Upstash Redis via `@upstash/ratelimit` + `@upstash/redis`.

Why:
- Works in serverless/edge environments
- Shared counters across instances
- Fast to integrate

Fallback behavior:
- In development, allow an in-memory limiter or no-op mode behind config
- In production, fail closed only on write endpoints if limiter is unavailable

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

## 6. Implementation Plan

### Phase 0: Prerequisites

1. Add dependencies:
- `@upstash/ratelimit`
- `@upstash/redis`

2. Add env vars:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RATE_LIMIT_ENABLED=true`
- `RATE_LIMIT_MODE=report|enforce` (supports report-only rollout in Phase 7)

### Phase 1: Shared Limiter Library

Create:
- `src/lib/rate-limit/policies.ts`
- `src/lib/rate-limit/client.ts`
- `src/lib/rate-limit/identity.ts`
- `src/lib/rate-limit/enforce.ts`
- `src/lib/rate-limit/response.ts`

Responsibilities:
- Define named policies
- Compute stable keys (`user:{id}`, `ip:{addr}`, `email:{hash}`)
- Enforce limit and return `{ allowed, remaining, reset }`
- Build standardized 429 JSON responses and headers (`Retry-After`, `X-RateLimit-*`)

### Phase 2: Route Handlers

Apply global IP-based rate limit in Next.js middleware (`middleware.ts`) as a first line of defense against broad abuse/scanning. Then apply per-route limiter checks to:
- `src/app/api/multiplayer/complete/route.ts`
- `src/app/api/leaderboard/route.ts`
- `src/app/api/leaderboard/ranked/route.ts`
- `src/app/api/get-user/route.ts`

Also add cache headers to leaderboard routes (`s-maxage` + `stale-while-revalidate`).
Implementation note: in `middleware.ts`, run rate limiting before the current anonymous-home early return so `/` is still covered.

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

### Phase 4: PartyKit Message Throttling

In `party/server.ts`, add per-connection token buckets:
- `progress`: max 25 messages/second
- `ready`, `finish`, `leave`: max 5 per 10 seconds
- `queue-join`, `match-join`: max 6 per minute

Behavior:
- Ignore excess messages first
- Disconnect repeat offenders after threshold breaches

### Phase 5: Idempotency Hardening (Critical Companion to Rate Limiting)

Rate limiting alone does not stop replay abuse. Add one-time processing semantics for match completion + XP/Elo award:
- Ensure a match result for `(match_id, user_id)` is processed exactly once
- If duplicate submission arrives, return prior result without re-awarding XP/Elo

Preferred approach:
- Add a `completed_at` or `processed` flag to `match_results`. The completion endpoint checks this flag before awarding XP/Elo.
- Wrap the check + XP award + Elo update in a single Supabase RPC function that uses the flag as a guard, ensuring atomicity.
- The unique constraint on `(match_id, user_id)` in `match_results` already prevents duplicate row inserts, but the side effects (XP/Elo) need this additional guard since they're separate operations today.

### Phase 6: Observability

Add structured logs on every blocked request:
- `policy`, `keyType`, `route/action`, `userId?`, `ipHash`, `remaining`, `reset`

Create weekly review metrics:
- Top blocked routes
- Unique blocked identities
- Error/false-positive reports

### Phase 7: Rollout

1. Report-only mode (24-72h): log overages, do not block.
2. Enforce on write paths.
3. Enforce on read paths.
4. Tune thresholds.

## 7. Acceptance Criteria

- Write endpoints/actions return 429 once limits are exceeded.
- 429 responses include `Retry-After` and `X-RateLimit-*` headers.
- PartyKit drops/disconnects abusive message rates.
- No observed impact to normal play loops (singleplayer, multiplayer, friends, auth).
- Duplicate completion attempts do not award XP/Elo more than once.

## 8. Risks and Mitigations

- Risk: false positives for fast legitimate users.
  - Mitigation: report-only rollout, per-policy tuning.

- Risk: limiter backend outage.
  - Mitigation: fallback mode by route type (fail closed for high-risk writes, fail open for low-risk reads).

- Risk: IP-only keys penalize shared networks.
  - Mitigation: prefer authenticated `userId` key when available; keep IP as secondary control.

## 9. Estimated Execution Order

1. Build shared limiter library.
2. Protect `multiplayer/complete` and auth actions.
3. Protect singleplayer/friend server actions.
4. Add PartyKit throttling.
5. Add idempotency guard for match completion side effects.
6. Roll out with monitoring and tune.
