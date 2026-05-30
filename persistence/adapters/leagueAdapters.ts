import { EntityManager, Repository } from "typeorm";

import appDataSource from "../../config/datasource";
import { LeagueStorePort, LeagueTransactionalStorePort, LeagueTransactionPort } from "../../services/ports/leaguePorts";
import { LeagueEntity, LeagueEntityData } from "../entities/LeagueEntity";
import { fromLeagueEntity, toLeagueEntityData } from "../mappers/leagueMapper";
import { leagueRepository } from "../repositories/repositories";

const createLeagueStoreFromRepository = (repository: Repository<LeagueEntityData>): LeagueStorePort => ({
    save: async (league) => {
        const savedEntity = await repository.save(toLeagueEntityData(league) as any);
        return fromLeagueEntity(savedEntity);
    },

    findBySeason: async (season) => {
        const entities = await repository.find({
            where: { season },
            relations: ["clubs"]
        });

        return entities.map((entity) => fromLeagueEntity(entity));
    },

    findBySeasonAndDivisionalPosition: async (season, divisionLevel, serialNumberOnDivisionLevel) => {
        const entity = await repository.findOne({
            where: {
                season,
                divisionLevel,
                serialNumberOnDivisionLevel
            }
        });

        return entity ? fromLeagueEntity(entity) : null;
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
