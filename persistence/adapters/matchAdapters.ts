import { EntityManager, Repository } from "typeorm";

import { fromMatchEntity, toMatchEntityData } from "../mappers/matchMapper";
import { matchRepository } from "../repositories/repositories";
import { MatchStorePort, MatchTransactionalStorePort, MatchTransactionPort } from "../../dataAccess/ports/matchPorts";
import Match from "../../domainCore/Match";
import { MatchEntity, MatchEntityData } from "../entities/MatchEntity";
import appDataSource from "../../config/datasource";


const createMatchStoreFromRepository = (repository: Repository<MatchEntityData>): MatchStorePort => ({
    save: async (match: Match) => {
        const savedEntity = await repository.save(toMatchEntityData(match) as any);
        return fromMatchEntity(savedEntity);
    },

    findById: async (id: number) => {
        const entity = await repository.findOne({ where: { id } });
        return entity ? fromMatchEntity(entity) : null;
    },

    findByLeagueId: async (leagueId: number) => {
        const entities = await repository.find({ where: { leagueId } });
        return entities.map((entity) => fromMatchEntity(entity));
    },

    findByLeagueIdAndWeek: async (leagueId: number, week: number) => {
        const entities = await repository.find({ where: { leagueId, week } });
        return entities.map((entity) => fromMatchEntity(entity));
    }
});

const createMatchTransactionalStoreFromRepository = (repository: Repository<MatchEntityData>): MatchTransactionalStorePort => ({
    ...createMatchStoreFromRepository(repository),

    saveMatches: async (matches: Match[]) => {
        const entities = matches.map((match) => toMatchEntityData(match));
        await repository.save(entities as any);
    }
});

export const defaultMatchStorePort: MatchStorePort = createMatchStoreFromRepository(matchRepository);

export const defaultMatchTransactionPort: MatchTransactionPort = {
    runInTransaction: async <T>(operation: (store: MatchTransactionalStorePort) => Promise<T>): Promise<T> => {
        return appDataSource.transaction(async (entityManager: EntityManager) => {
            const transactionalRepository = entityManager.getRepository<MatchEntityData>(MatchEntity);
            const transactionalStore = createMatchTransactionalStoreFromRepository(transactionalRepository);
            return operation(transactionalStore);
        });
    }
};
