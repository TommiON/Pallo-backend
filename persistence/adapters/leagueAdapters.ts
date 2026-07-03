import { EntityManager, Repository } from "typeorm";

import appDataSource from "../../config/datasource";
import { LeagueStorePort, LeagueTransactionalStorePort, LeagueTransactionPort } from "../../dataAccess/ports/leaguePorts";
import { LeagueEntity, LeagueEntityData } from "../entities/LeagueEntity";
import { fromLeagueEntity, toLeagueEntityData } from "../mappers/leagueMapper";
import { leagueRepository } from "../repositories/repositories";
import League from "../../domainCore/League";

// Wires promotesTo object references for a set of leagues that were loaded together.
// Reads promotesToId from the raw entities (persistence concern) and resolves it to the
// corresponding domain League object. Only safe to call when all parents are in the same set.
const wireLeagueGraph = (entities: LeagueEntityData[], leagues: League[]): void => {
    const byId = new Map<number, League>();
    leagues.forEach((league) => {
        if (league.id !== undefined) {
            byId.set(league.id, league);
        }
    });

    entities.forEach((entity, i) => {
        if (entity.promotesToId !== undefined) {
            leagues[i].promotesTo = byId.get(entity.promotesToId) ?? null;
        }
    });
};

const createLeagueStoreFromRepository = (repository: Repository<LeagueEntityData>): LeagueStorePort => ({
    save: async (league) => {
        const savedEntity = await repository.save(toLeagueEntityData(league) as any);
        return fromLeagueEntity(savedEntity);
    },

    findBySeason: async (season) => {
        const entities = await repository.find({
            where: { season },
            relations: ["clubs", "matches", "matches.homeClub", "matches.awayClub"]
        });

        const leagues = entities.map((entity) => fromLeagueEntity(entity));
        wireLeagueGraph(entities, leagues);
        return leagues;
    },

    findBySeasonAndDivisionalPosition: async (season, divisionLevel, serialNumberOnDivisionLevel) => {
        const entity = await repository.findOne({
            where: {
                season,
                divisionLevel,
                serialNumberOnDivisionLevel
            },
            relations: ["clubs", "matches", "matches.homeClub", "matches.awayClub"]
        });

        if (!entity) {
            return null;
        }

        const league = fromLeagueEntity(entity);

        // Keep promotesTo id available even in single-league queries where graph wiring is not used.
        if (entity.promotesToId !== undefined) {
            league.promotesTo = { id: entity.promotesToId } as League;
        }

        return league;
    },

    findChildrenForLeague: async (leagueId) => {
        const entities = await repository.find({
            where: { promotesToId: leagueId }
        });

        return entities.map((entity) => fromLeagueEntity(entity));
    }
});

const createTransactionalLeagueStore = (
    repository: Repository<LeagueEntityData>,
    manager: EntityManager
): LeagueTransactionalStorePort => ({
    ...createLeagueStoreFromRepository(repository),

    addClubsToLeague: async (leagueId, clubIds) => {
        if (clubIds.length === 0) {
            return;
        }

        await manager
            .createQueryBuilder()
            .relation("league", "clubs")
            .of(leagueId)
            .add(clubIds);
    }
});

export const defaultLeagueStorePort: LeagueStorePort = createLeagueStoreFromRepository(leagueRepository);

export const defaultLeagueTransactionPort: LeagueTransactionPort = {
    runInTransaction: async <T>(operation: (store: LeagueTransactionalStorePort) => Promise<T>): Promise<T> => {
        return appDataSource.transaction(async (manager: EntityManager) => {
            const transactionalRepository = manager.getRepository<LeagueEntityData>(LeagueEntity);
            const transactionalStore = createTransactionalLeagueStore(transactionalRepository, manager);
            return operation(transactionalStore);
        });
    }
};
