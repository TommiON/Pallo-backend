import { EntityManager, Repository } from "typeorm";

import appDataSource from "../datasource/datasource";
import Tactics, { MatchSide } from "../../domainCore/Tactics";
import { TacticsStorePort, TacticsTransactionPort } from "../../dataAccess/ports/tacticsPorts";
import { TacticsEntity, TacticsEntityData } from "../entities/TacticsEntity";
import { fromTacticsEntity, toTacticsEntityData } from "../mappers/tacticsMapper";
import { tacticsRepository } from "../repositories/repositories";

const createTacticsStoreFromRepository = (repository: Repository<TacticsEntityData>): TacticsStorePort => ({
    saveForMatch: async (matchId: number, side: MatchSide, tactics: Tactics): Promise<Tactics> => {
        const mergedTactics = { ...tactics, matchId, side } as Tactics;
        const entityData = toTacticsEntityData(mergedTactics);
        const savedEntity = await repository.save(entityData as any);
        return fromTacticsEntity(savedEntity);
    },

    findById: async (id: number): Promise<Tactics | null> => {
        const entity = await repository.findOne({
            where: { id },
            relations: { lineupSlots: true }
        });

        return entity ? fromTacticsEntity(entity) : null;
    },

    findByMatchIdAndSide: async (matchId: number, side: MatchSide): Promise<Tactics | null> => {
        const entity = await repository.findOne({
            where: { matchId, side },
            relations: { lineupSlots: true }
        });

        return entity ? fromTacticsEntity(entity) : null;
    },

    findByMatchId: async (matchId: number): Promise<Tactics[]> => {
        const entities = await repository.find({
            where: { matchId },
            relations: { lineupSlots: true }
        });

        return entities.map((entity) => fromTacticsEntity(entity));
    },

    lockForMatch: async (matchId: number, side: MatchSide): Promise<void> => {
        await repository.update({ matchId, side }, { locked: true });
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
