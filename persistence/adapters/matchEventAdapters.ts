import { EntityManager, Repository } from "typeorm";

import { fromMatchEventEntity, toMatchEventEntityData } from "../mappers/matchEventMapper";
import { matchEventRepository } from "../repositories/repositories";
import { MatchEventStorePort, MatchEventTransactionalStorePort, MatchEventTransactionPort } from "../../dataAccess/ports/matchEventPorts";
import MatchEvent from "../../domainCore/MatchEvent";
import { MatchEventEntity, MatchEventEntityData } from "../entities/MatchEventEntity";
import appDataSource from "../../config/datasource";

const createMatchEventStoreFromRepository = (repository: Repository<MatchEventEntityData>): MatchEventStorePort => ({
    save: async (event: MatchEvent) => {
        const savedEntity = await repository.save(toMatchEventEntityData(event) as any);
        return fromMatchEventEntity(savedEntity);
    },

    findById: async (id: number) => {
        const entity = await repository.findOne({ where: { id } });
        return entity ? fromMatchEventEntity(entity) : null;
    },

    findByMatchId: async (matchId: number) => {
        const entities = await repository.find({ where: { matchId } });
        return entities.map((entity) => fromMatchEventEntity(entity));
    }
});

const createMatchEventTransactionalStoreFromRepository = (repository: Repository<MatchEventEntityData>): MatchEventTransactionalStorePort => ({
    ...createMatchEventStoreFromRepository(repository),

    saveMatchEvents: async (events: MatchEvent[]) => {
        const entities = events.map((event) => toMatchEventEntityData(event));
        await repository.save(entities as any);
    }
});

export const defaultMatchEventStorePort: MatchEventStorePort = createMatchEventStoreFromRepository(matchEventRepository);

export const defaultMatchEventTransactionPort: MatchEventTransactionPort = {
    runInTransaction: async <T>(operation: (store: MatchEventTransactionalStorePort) => Promise<T>): Promise<T> => {
        return appDataSource.transaction(async (entityManager: EntityManager) => {
            const transactionalRepository = entityManager.getRepository<MatchEventEntityData>(MatchEventEntity);
            const transactionalStore = createMatchEventTransactionalStoreFromRepository(transactionalRepository);
            return operation(transactionalStore);
        });
    }
};