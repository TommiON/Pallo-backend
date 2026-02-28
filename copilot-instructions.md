# Pallo Backend - Copilot Instructions

This document describes the architecture, patterns, and conventions used in the Pallo backend project. Use these guidelines when extending or modifying the codebase.

## Project Overview

**Pallo** is a football (soccer) club management backend built with:
- **Framework**: Express.js (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Architecture**: Clean domain-driven design with separation of layers

## Directory Structure

```
api/                    # HTTP API routes and request/response types
├── player/             # Player endpoints
│   ├── PlayerRequest.ts
│   ├── PlayerResponse.ts
│   ├── playerRoutes.ts
│   └── playerRequestValidator.ts
├── club/               # Club endpoints
│   ├── ClubRequest.ts
│   ├── ClubResponse.ts
│   ├── clubRoutes.ts
│   └── clubRequestValidator.ts
├── ApiResponse.ts      # Shared response wrapper
└── ApiError.ts         # Shared error types

config/                 # Application configuration
├── datasource.ts       # TypeORM DataSource setup
└── environment.ts      # Environment variables

domainModel/            # Core business logic (domain-driven design)
├── player/
│   ├── Player.ts       # Domain entity
│   ├── Footedness.ts   # Value object
│   └── playerFactoryUtils.ts
├── club/
│   └── Club.ts         # Domain entity with factory methods
└── ...

domainProperties/       # Constants and configuration
├── domainProperties.ts # Domain-level constants

persistence/            # Data access layer
├── entities/           # TypeORM entity schema definitions
│   ├── PlayerEntity.ts
│   ├── ClubEntity.ts
│   └── sharedEntityBase.ts
└── repositories/       # Repository instances
    └── repositories.ts

services/               # Business logic / use case orchestration
├── playerService.ts
├── clubService.ts
└── ...

utils/                  # Utility functions and helpers
├── randomizer.ts
├── passwordUtils.ts
└── ...

index.ts               # Application entry point
```

## Architecture & Patterns

### 1. Domain Model Layer (`domainModel/`)

Pure business logic with no database or framework dependencies.

**Player Domain Model:**
```typescript
export default class Player {
    id?: number;
    name: string;
    age: number;
    footedness: Footedness;
    clubId?: number;      // Foreign key reference
    club?: Club;          // Domain object reference
    
    constructor() {
        this.name = generatePlayerName();
        this.age = generatePlayerAge();
        this.footedness = generatePlayerFootedness();
    }
}
```

**Club Domain Model:**
```typescript
export default class Club {
    id?: number;
    name: string;
    passwordHash?: string;
    established: Date;
    zombie: boolean;
    players?: Player[];    // One-to-many relationship

    static create = async (name: string, password: string): Promise<Club> {
        // Use factory methods for complex initialization
        // (e.g., async password hashing)
    }

    static createZombie = (): Club {
        // Zombie clubs represent players without a real club
    }
}
```

**Key Principles:**
- Domain entities contain both scalar FK (`clubId`) and object references (`club`) for flexibility
- Use factory methods (static async) for complex initialization requiring I/O
- Keep domain entities focused on business rules, not DB details

### 2. Persistence Layer (`persistence/`)

Maps domain objects to database via TypeORM EntitySchema.

**Entity Definition:**
```typescript
export const PlayerEntity = new EntitySchema<Player>({
    name: "player",
    columns: {
        ...sharedEntityBaseColumns,  // id, createdAt, updatedAt
        name: { type: "varchar" },
        age: { type: "int" },
        clubId: {
            name: "club_id",
            type: "int",
            nullable: true
        }
    },
    relations: {
        club: {
            target: "club",
            type: "many-to-one",
            joinColumn: { name: "club_id" }
        }
    }
});
```

**Shared Entity Base:**
- `id`: Primary key (auto-generated)
- `createdAt`: Timestamp (auto-set on insert)
- `updatedAt`: Timestamp (auto-set on insert/update)
- Both are marked `select: false` to exclude by default from queries

**Repository Pattern:**
```typescript
export const playerRepository = appDataSource.getRepository(PlayerEntity);
export const clubRepository = appDataSource.getRepository(ClubEntity);
```

**Querying Best Practices:**
- Use `select: [...]` to whitelist specific columns, or rely on `select: false` defaults
- Avoid `select: false` on entity columns that are frequently needed; prefer using defaults for sensitive/large fields
- Use `relations` in `find()` to eager-load related entities

### 3. Service Layer (`services/`)

Orchestrates domain logic and persistence operations.

**Example: Club Creation with Players**
```typescript
export const createClub = async(name: string, password?: string): Promise<Club> => {
    const club = await Club.create(name, password || "");
    const savedClub = await clubRepository.save(club);

    const players: Player[] = [];
    for (let i = 0; i < CLUB_NUMBER_OF_PLAYERS_AT_START; i++) {
        const p = new Player();
        p.clubId = savedClub.id;
        p.club = savedClub;
        players.push(p);
    }

    const savedPlayers = await playerRepository.save(players);
    savedClub.players = savedPlayers;

    return savedClub;
};
```

**Key Principles:**
- Services receive request/search parameters and return domain objects
- Services handle transactions and complex multi-step operations
- Services do not format responses (that's the API layer's job)

### 4. API Layer (`api/`)

HTTP routing and request/response handling.

**Request Types:**
```typescript
export interface PlayerRequest {
    ids: number[];
}
```

**Response Types:**
- Use `type` (not `interface`) for response unions and utility types
- Use utility types (`Omit`, `Pick`, intersection `&`) to derive from domain objects
- Never extend `Response<T>` to avoid type conflicts

```typescript
export type StrippedResponse = Omit<Player, 'footedness'>;
export type LargeResponse = Player & {
    team: string;
    position: string;
    stats: { … };
};
export type PlayerListResponse = (LargeResponse | StrippedResponse)[];
```

**Request Validators:**
- Implement as `RequestHandler<any, any, RequestBodyType>`
- Validate request body and call `next()` on success
- Return error response with `res.status(…).json(…)` on failure

```typescript
export const playerRequestValidator: RequestHandler<any, any, PlayerRequest> = (req, res, next) => {
    const errors: ValidationError[] = [];
    if (!Array.isArray(req.body.ids)) {
        errors.push('MALFORMATTED_PARAMETERS');
    }
    if (errors.length > 0) {
        res.status(400).json(sendErrorResponse(errors));
    } else {
        next();
    }
};
```

**Route Handlers:**
- Use `Response<ApiResponse<T>>` to type the JSON response body
- Call helpers like `sendSuccessResponse(data)` to build response objects
- Pass validators as middleware before the handler

```typescript
playerRouter.get(
    `${baseUrl}/`,
    playerRequestValidator,
    async (req: Request<any, any, PlayerRequest>, res: Response<ApiResponse<PlayerResponse>>) => {
        const result = await findPlayersByIds(req.body.ids);
        res.json(sendSuccessResponse([...result.ownPlayers, ...result.othersPlayers]));
    }
);
```

**ApiResponse Type:**
```typescript
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    errors?: string[];
}

export const sendSuccessResponse = <T>(data: T): ApiResponse<T> => ({
    success: true,
    data,
});

export const sendErrorResponse = (errorMessages: string[]): ApiResponse<never> => ({
    success: false,
    errors: errorMessages,
});
```

### 5. Relationships

**One-to-Many: Club → Players**
- Club has `players?: Player[]`
- Player has `clubId?: number` (FK) and `club?: Club` (reference)
- Foreign key is nullable to allow players without a club (zombie clubs)

**Querying with Relations:**
```typescript
// Load club with its players
const club = await clubRepository.find({
    where: { id: clubId },
    relations: ['players']
});

// Load players with their club
const players = await playerRepository.find({
    where: { id: In(ids) },
    relations: ['club']
});
```

## Conventions

### Naming

- **Domain models**: PascalCase classes (`Player`, `Club`)
- **Entity schemas**: Append `Entity` suffix (`PlayerEntity`, `ClubEntity`)
- **Service functions**: camelCase with `create`, `find`, `update` prefix (`createClub`, `findPlayersByIds`)
- **Repositories**: `${entity}Repository` (`playerRepository`, `clubRepository`)
- **Routes**: Plural form matching feature (`/api/player`, `/api/club`)

### Type Annotations

- **Request body types**: `Request<Params, Response, Body>`
  - Use `RequestHandler<Params, ResponseBody, RequestBody>` for middleware/handlers
- **Response types**: `Response<ApiResponse<T>>`
- **Response data types**: Use `type` keyword, not `interface`
- **Union types**: Use `|` in type definitions
- **Utility types**: Prefer `Omit`, `Pick`, intersection for derivation from domain

### File Organization

- One entity/type per file
- Group related features in feature folders (`player/`, `club/`)
- Share common patterns in parent folders (`ApiResponse.ts`, `sharedEntityBase.ts`)

### Database

- Use TypeORM `EntitySchema` for schema definition
- Store timestamps automatically via `createDate` and `updateDate` options
- Mark internal/audit columns with `select: false` to exclude by default
- Use nullable FK columns for optional relationships
- Use `unique: true` for unique constraints (e.g., `Club.name`)

### Testing

- Use Jest for unit and integration tests
- Place tests in `tests/` subdirectories alongside code
- Test domain model logic independently of persistence
- Test service layer with mocked repositories

```typescript
// Example: domainModel/player/tests/player.test.ts
describe('Player', () => {
    it('should create a player with generated properties', () => {
        const player = new Player();
        expect(player.name).toBeDefined();
        expect(player.age).toBeGreaterThanOrEqual(PLAYER_MIN_AGE);
    });
});
```

## Common Tasks

### Adding a New Domain Entity

1. **Create the domain model** in `domainModel/{feature}/{Entity}.ts`
2. **Create the TypeORM entity** in `persistence/entities/{Entity}Entity.ts`
3. **Register the repository** in `persistence/repositories/repositories.ts`
4. **Create service functions** in `services/{feature}Service.ts`
5. **Create request/response types** in `api/{feature}/{Feature}Request.ts`, `{Feature}Response.ts`
6. **Create validators** in `api/{feature}/{feature}Validator.ts` (if needed)
7. **Create routes** in `api/{feature}/{feature}Routes.ts`
8. **Register router** in `index.ts`

### Adding a Relationship

1. **Update the domain models** with FK and object references (both directions if bidirectional)
2. **Add the FK column** to the entity owning the relationship (with `nullable: true` if optional)
3. **Define the relation** in the entity schema (`relations` property)
4. **Update domain properties** if needed (e.g., initial size for one-to-many)
5. **Update services** that create related objects to set both FK and reference

### Handling Timestamps

Timestamps (`createdAt`, `updatedAt`) are automatically managed by TypeORM:
- Automatically set on insert/update
- Marked `select: false` in `sharedEntityBase` to exclude by default
- Include them in queries only when needed: `addSelect("entity.createdAt")`

### Querying Without Sensitive Fields

Use the `select: false` default in `sharedEntityBase`:
```typescript
const players = await playerRepository.find({
    where: { id: In(ids) },
    // createdAt and updatedAt are excluded by default
});
```

To include them explicitly:
```typescript
const players = await playerRepository
    .createQueryBuilder('player')
    .addSelect('player.createdAt')
    .addSelect('player.updatedAt')
    .getMany();
```

## Environment & Configuration

**Environment Variables** (`.env`):
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=user
DB_PASSWORD=pass
DB_NAME=pallo
PORT=3000
```

**Import Configuration:**
```typescript
import environment from "./config/environment";
console.log(environment.port); // Access via object
```

## Running the Application

```bash
# Development (with auto-reload)
npm run start-dev

# Run tests
npm run test
```

## TypeScript & Strict Mode

- TypeScript strict mode is enabled
- Always annotate function parameters and return types
- Use `?` for optional properties/parameters
- Avoid `any` unless unavoidable; use generics instead

## Key Dependencies

- **typeorm**: Object-relational mapper for PostgreSQL
- **express**: HTTP server framework
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT authentication (prepared for future use)
- **cors**: Cross-Origin Resource Sharing middleware
- **dotenv**: Environment variable management
- **jest**: Testing framework

## Future Enhancements

- Add authentication/authorization (JWT)
- Implement transaction management for complex operations
- Add comprehensive error handling middleware
- Implement query result pagination
- Add logging/monitoring
- Set up database migrations
