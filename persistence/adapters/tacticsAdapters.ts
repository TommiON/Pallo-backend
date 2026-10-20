import { EntityManager, Repository } from "typeorm";

import appDataSource from "../datasource/datasource";
import Tactics from "../../domainCore/Tactics";
import { TacticsStorePort, TacticsTransactionPort } from "../../dataAccess/ports/tacticsPorts";
import { TacticsEntity, TacticsEntityData } from "../entities/TacticsEntity";
import { fromTacticsEntity, toTacticsEntityData } from "../mappers/tacticsMapper";
import { tacticsRepository } from "../repositories/repositories";

const createTacticsStoreFromRepository = (repository: Repository<TacticsEntityData>): TacticsStorePort => ({
    save: async (tactics: Tactics): Promise<Tactics> => {
        const savedEntity = await repository.save(toTacticsEntityData(tactics) as any);
        return fromTacticsEntity(savedEntity);
    },

    findById: async (id: number): Promise<Tactics | null> => {
        const entity = await repository.findOne({
            where: { id },
            relations: { lineupSlots: true }
        });

        return entity ? fromTacticsEntity(entity) : null;
    }
});

export const defaultTacticsStorePort: TacticsStorePort = createTacticsStoreFromRepository(tacticsRepository);

export const defaultTacticsTransactionPort: TacticsTransactionPort = {
    runInTransaction: async <T>(operation: (store: TacticsStorePort) => Promise<T>): Promise<T> => {
        return appDataSource.transaction(async (manager: EntityManager) => {
            const transactionalRepository = manager.getRepository<TacticsEntityData>(TacticsEntity);
            const transactionalStore = createTacticsStoreFromRepository(transactionalRepository);
            return operation(transactionalStore);
        });
    }
};
