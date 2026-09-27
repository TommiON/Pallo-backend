import { EntityManager, Repository } from "typeorm";

import MatchNature from "../../domainCore/MatchNature";
import { fromMatchNatureEntity, toMatchNatureEntityData } from "../mappers/matchNatureMapper";
import { MatchNatureStorePort, MatchNatureTransactionPort, MatchNatureTransactionalStorePort } from "../../dataAccess/ports/matchNaturePorts";
import { matchNatureRepository } from "../repositories/repositories";
import { MatchNatureEntityData, MatchNatureEntity } from "../entities/MatchNatureEntity";
import appDataSource from "../datasource/datasource";

const createMatchNatureStoreFromRepository = (repository: Repository<MatchNatureEntityData>): MatchNatureStorePort => ({
    save: async (matchNature: MatchNature) => {
        const savedEntity = await repository.save(toMatchNatureEntityData(matchNature));
        return fromMatchNatureEntity(savedEntity);
    },

    findById: async (id: number) => {   
        const entity = await repository.findOne({ where: { id } });
        return entity ? fromMatchNatureEntity(entity) : null;
    },

    findByMatchId: async (matchId: number) => {
        const entities = await repository.find({ where: { matchId } });
        return entities.map(fromMatchNatureEntity);
    }
});

const createMatchNatureTransactionalStoreFromRepository = (repository: Repository<MatchNatureEntityData>): MatchNatureTransactionalStorePort => ({
    ...createMatchNatureStoreFromRepository(repository),

    saveMatchNatures: async (matchNatures: MatchNature[]) => {
        const entities = matchNatures.map((matchNature) => toMatchNatureEntityData(matchNature));
        await repository.save(entities as any);
    }
});

export const defaultMatchNatureStorePort: MatchNatureStorePort = createMatchNatureStoreFromRepository(matchNatureRepository);

export const defaultMatchNatureTransactionPort: MatchNatureTransactionPort = {
    runInTransaction: async <T>(operation: (store: MatchNatureTransactionalStorePort) => Promise<T>): Promise<T> => {
        return appDataSource.transaction(async (entityManager: EntityManager) => {
            const transactionalRepository = entityManager.getRepository<MatchNatureEntityData>(MatchNatureEntity);
            const transactionalStore = createMatchNatureTransactionalStoreFromRepository(transactionalRepository);
            return operation(transactionalStore);
        });
    }
} 