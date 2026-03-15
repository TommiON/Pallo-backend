# Copilot instructions for Pallo-backend

## Big picture (read this first)
- Stack: Express + TypeScript + TypeORM + PostgreSQL. App entry is [index.ts](../index.ts).
- Layering is intentional: `api -> services -> domainModel -> persistence`.
- Domain objects are not TypeORM entities. Mapping is explicit via `fromEntity()` / `toEntity()` (example: [domainModel/player/Player.ts](../domainModel/player/Player.ts)).
- Repositories are centralized in [persistence/repositories/repositories.ts](../persistence/repositories/repositories.ts); services should use those exports.

## Runtime flow and important side effects
- Startup order in [index.ts](../index.ts): initialize DB, then initialize/start domain engine, then listen HTTP.
- Domain engine boot in [domainEngine/main.ts](../domainEngine/main.ts):
  - Initializes `SeasonRunner` and `WeekRunner`.
  - Registers time listeners on `Time`.
  - Calls `initializeTime()` and may start scheduler (`setInterval`) based on domain properties.
- `Time` is effectively a singleton persisted row (`id = 1`), see [domainModel/time/Time.ts](../domainModel/time/Time.ts) and [services/timeService.ts](../services/timeService.ts).

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
