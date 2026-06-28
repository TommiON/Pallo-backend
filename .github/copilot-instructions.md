# Copilot instructions for Pallo-backend

## Big picture (read this first)
- Stack: Express + TypeScript + TypeORM + PostgreSQL. App entry is [index.ts](../index.ts).
- Layering is intentional: `api -> controllers -> dataAccess -> domainCore -> persistence`.
- Domain objects are not TypeORM entities. Mapping is explicit in persistence mappers (example: [persistence/mappers/playerMapper.ts](../persistence/mappers/playerMapper.ts)).
- Repositories are centralized in [persistence/repositories/repositories.ts](../persistence/repositories/repositories.ts); services should use those exports.

## Runtime flow and important side effects
- Startup order in [index.ts](../index.ts): initialize DB, then initialize/start domain engine, then listen HTTP.
- Domain engine boot in [domainEngine/main.ts](../domainEngine/main.ts):
  - Initializes `SeasonRunner` and `WeekRunner`.
  - Registers in-process handlers on `eventNotifications`.
  - Calls `initializeTime()` and may start scheduler (`setInterval`) based on domain properties.
- `Time` is effectively a singleton persisted row (`id = 1`), with singleton identity handled in persistence adapters/mappers.

## Optional: Multi-instance readiness (future architecture)

Use this section only when designing for possible horizontal scaling (multiple backend instances sharing one database).

### Current readiness snapshot
- Safe-ish now: core write paths are increasingly transactional (`createClub`, `initializeTime`, `advanceTime`).
- Not multi-instance safe yet: `eventNotifications` is in-memory per process, `SeasonRunner` uses process-local static flags, and scheduler startup is per-process.
- Operational risk if scaled as-is: each instance could run its own `setInterval`, causing duplicate time advancement and duplicate season orchestration.

### Rules when adding new behavior
- Do not rely on in-memory state (`static` flags, process-local caches, in-process bus) for cross-instance correctness.
- Keep critical state transitions idempotent and guarded in DB (e.g., unique constraints + conditional updates).
- Emit notifications only after successful DB commit; avoid side effects inside open transactions.
- Prefer transaction-scoped repositories from `getTransactionalRepositories(manager)` for multi-write operations.

### Scheduler and orchestration guidance
- Treat scheduler ownership as a distributed concern: only one instance should perform "clock tick" advancement at a time.
- If/when scaling: add a leader/lease mechanism before enabling multi-instance scheduler.
  - Good DB-first option: PostgreSQL advisory lock for scheduler ownership.
  - Alternative: leader row with lease timestamp updated by heartbeat transaction.
- Keep orchestration handlers (`SeasonRunner`, future league generation) re-entrant and safe to retry.

### Eventing guidance
- Keep `eventNotifications` for local in-process reactions only.
- For cross-instance delivery, move to durable integration events (outbox table + worker, or message broker).
- When adding a new event, decide explicitly:
  - local process event only (`eventNotifications`), or
  - durable cross-instance event (outbox/broker path).

### Persistence and deploy guidance
- For multi-instance deployments, prefer migrations over `synchronize: true` to avoid startup schema races.
- Add DB constraints that enforce once-only semantics for season/league creation flows as they are implemented.

### Multi-instance pre-deploy checklist
- Scheduler ownership is distributed: only one instance can tick time at once (advisory lock or lease row).
- Cross-instance events are durable: critical flows do not depend only on in-memory `eventNotifications`.
- Critical write paths are idempotent and DB-guarded (unique constraints / conditional updates).
- Side effects are commit-after: notifications and external effects are emitted only after successful DB commit.
- Schema rollout is migration-based: `synchronize: true` is disabled for multi-instance environments.
- Orchestration handlers are retry-safe: repeated execution does not duplicate leagues/seasons/matches.
- Operational check exists: a test or runbook verifies no duplicate clock ticks under two running instances.

## Optional: Domain identity vs persistence identity (future architecture)
- Treat domain identity and persistence identity as separate concepts.
  - Domain identity: used by domainCore entities (Club, League, Player, Match, MatchEvent, possibly Time).
  - Persistence identity: DB row id and foreign key columns used only in persistence and adapters.
- Do not let domainCore depend on DB id shape (`id`, `*_id`) when it is not domain-significant.
- Keep entity/foreign-key translation in persistence mappers and adapters.
- Prefer dataAccess ports that expose domain concepts; adapter implementations may use DB ids internally.

## Optional: Finalizing dependency purity (persistence/dataAccess)

Use this section when completing the ports/adapters architecture so dependency direction is strict:
`api/controllers/domainEngine -> dataAccess ports/use-cases -> persistence adapters`.

### Goal state
- dataAccess exposes interfaces and use-case factories only; no default self-wiring to persistence.
- persistence implements dataAccess ports.
- Wiring happens in one composition root at app startup (not inside dataAccess modules).
- domainEngine runners and `main.ts` receive dependencies as injected collaborators instead of importing concrete dataAccess singletons.

### Why this is postponed
- `domainEngine/main.ts` and runner structure are expected to change; complete purity work should happen after those refactors to avoid duplicate churn.

### Target composition approach
- Keep factory exports like `createAuthService`, `createClubService`, `createLeagueService`, `createPlayerService`, `createTimeService`.
- Remove module-level singleton instances from dataAccess service files.
- Replace dataAccess `composition/*` defaults with an app-level composition root (for example startup wiring near `index.ts`).
- Pass wired dependencies to route/controller/domain initialization functions.

### Migration order (recommended)
1. Refactor `domainEngine/main.ts` and runners to dependency-injected initialization APIs.
2. Convert API route modules to router factories that accept use-cases/controllers.
3. Migrate one vertical slice first (Auth), then Club, then Time/League/Player.
4. Remove remaining dataAccess self-wiring and delete/relocate `dataAccess/composition`.

### Guardrails while migrating
- Avoid controller-type imports in dataAccess (define shared DTO/identity types in dataAccess or neutral layer).
- Keep persistence details (`Repository`, TypeORM-specific entities) out of dataAccess ports.
- Emit side effects/events only after successful transactional persistence.
- Preserve public API behavior while changing internals.

### Done criteria
- No dataAccess file imports from persistence.
- Exactly one composition root wires adapters to use-cases.
- `main.ts` and runners accept injected dependencies.
- Tests can instantiate use-cases with in-memory or mocked ports without touching persistence modules.

## API conventions specific to this codebase
- Response envelope is always `ApiResponse<T>` via `sendSuccessResponse()` / `sendErrorResponse()` from [api/ApiResponse.ts](../api/ApiResponse.ts).
- Validation is middleware-first; validators collect `ValidationError[]` string unions from [api/ValidationError.ts](../api/ValidationError.ts).
- Auth middleware stores identity in `res.locals.authenticatedUser` (see [api/authValidator.ts](../api/authValidator.ts)).
- Several GET routes read request body (non-standard HTTP usage); preserve existing behavior unless explicitly changing API contract (examples: [api/player/playerRoutes.ts](../api/player/playerRoutes.ts), [api/club/clubRoutes.ts](../api/club/clubRoutes.ts)).

## Persistence and data modeling patterns
- Uses `EntitySchema` files instead of decorator classes (see [persistence/entities](../persistence/entities)).
- Shared base columns (`id`, `created_at`, `updated_at`) come from [persistence/entities/sharedEntityBase.ts](../persistence/entities/sharedEntityBase.ts).
- `DataSource` has `synchronize: true` in [config/datasource.ts](../config/datasource.ts) (schema auto-sync, no migrations currently).

## Service-layer patterns to follow
- Services orchestrate repository calls and domain mapping; routes should stay thin.
- New clubs create initial players in service layer (see [services/clubService.ts](../services/clubService.ts)).
- Current code sometimes uses `as any` on `repository.save(...)` due TypeORM typing friction; keep changes minimal and consistent with nearby code.

## DomainEngine ↔ service boundary guideline
- Query-style service methods for DomainEngine should return ids or minimal readonly shapes, not full domain objects by default.
- Behavior-heavy methods should accept ids, load needed entities internally, and then operate on domain objects inside service/engine code.
- Apply this especially in season/week orchestration paths (see [domainEngine/runners/SeasonRunner.ts](../domainEngine/runners/SeasonRunner.ts), [domainEngine/runners/WeekRunner.ts](../domainEngine/runners/WeekRunner.ts)).
- If multiple engine flows need the same partial payload, introduce a small explicit internal type for that use case instead of reusing API response contracts.

## Developer workflow (actual commands in this repo)
- Run dev server: `npm run start-dev`
- Run tests: `npm test`
- Jest + ts-jest config is in [jest.config.js](../jest.config.js); tests are colocated under `*/tests/`.

## External integrations and config
- Environment variables are loaded in [config/environment.ts](../config/environment.ts): `PORT`, `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `TOKEN_SECRET`.
- JWT is used for auth (`jsonwebtoken`), password hashing uses `bcrypt`.

## When adding features
- Add/extend domain type contracts first (`*Data.ts`), then domain model, then persistence schema, then service, then API request/response + validator + route.
- Prefer showing domain intent in services and keep API mappers explicit (example: `restricted` player projection in [api/player/playerRoutes.ts](../api/player/playerRoutes.ts)).

## Domain object vs persistence id rules

Domain objects and persistence entities represent the same data differently. The border is intentional and must not blur.

### The hard rule
- In `domainCore/` and `domainEngine/`: **use object references for relationships only**. Relation id fields (e.g., `clubId`, `leagueId`, `promotesToId`) must not appear.
- In `persistence/entities/` and `persistence/adapters/`: **use FK ids**. This is the canonical home for `club_id`, `league_id`, etc.
- In `persistence/mappers/`: **translate between the two worlds**. This is the primary hard border.
- In `dataAccess/` (ports and services): a secondary contract border. Ids are acceptable in repository-oriented operations but must not shape domain objects.
- In `api/` and `controllers/`: ids in transport DTOs are fine. These are not domain internals.

### Mental lint rule
If you are writing code in `domainCore` or `domainEngine` and you reach for a `*Id` field, stop — pass or receive the object instead. If you are in `persistence`, the reverse applies.

### Relation ownership matrix

| Relationship | domainCore + domainEngine | dataAccess ports/services | persistence (entities/adapters/mappers) | api + controllers |
|---|---|---|---|---|
| `Player` → `Club` | `player.club` (object) | May filter/query by id | FK `club_id`; mapper converts | `clubId` in response DTO is fine |
| `League` → parent `League` (`promotesTo`) | `league.promotesTo` (object) | Orchestration may resolve parent ids during save transaction | FK `promotes_to_id`; mapper converts | Parent id may be exposed if useful |
| `Match` → `League` | `match.league` (object) | Repository writes may pass `leagueId` | FK `league_id`; mapper converts | `leagueId` in DTO is fine |
| `Match` → home/away `Club` | `match.homeClub`, `match.awayClub` (objects) | Id-based joins acceptable at repo boundary | FK `home_club_id`, `away_club_id`; mapper converts | Ids in response are fine |
| `MatchEvent` → `Match` | Object relation if domain behavior requires it; otherwise no domain need | Id-based writes acceptable at store boundary | FK `match_id`; mapper converts | `matchId` in DTO is fine |

### Optional hardening note
- `expandPyramid` should continue to consume `Club` domain objects, not raw ids. If the waiting-list source is id-based, convert ids to lightweight `Club` references at the outer boundary before entering `domainEngine/`.
