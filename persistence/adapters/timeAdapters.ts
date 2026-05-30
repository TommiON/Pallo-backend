import { EntityManager, Repository } from "typeorm";

import appDataSource from "../../config/datasource";
import Time from "../../domainModel/time/Time";
import { eventNotifications } from "../../dataAccess/eventNotifications";
import { TimeEventsPort, TimeStorePort, TimeTransactionPort } from "../../dataAccess/ports/timePorts";
import { TimeEntity, TimeEntityData } from "../entities/TimeEntity";
import { fromTimeEntity, toTimeEntityData } from "../mappers/timeMapper";
import { timeRepository } from "../repositories/repositories";

const createTimeStoreFromRepository = (repository: Repository<TimeEntityData>): TimeStorePort => ({
    getCurrent: async (): Promise<Time | null> => {
        const entity = await repository.findOne({ where: { id: 1 } });
        return entity ? fromTimeEntity(entity) : null;
    },

    getCurrentForUpdate: async (): Promise<Time | null> => {
        const entity = await repository
            .createQueryBuilder("time")
            .setLock("pessimistic_write")
            .where("time.id = :id", { id: 1 })
            .getOne();

        return entity ? fromTimeEntity(entity) : null;
    },

    insertIfMissing: async (initialTime: Time): Promise<void> => {
        await repository
            .createQueryBuilder()
            .insert()
            .into(TimeEntity)
            .values(toTimeEntityData(initialTime) as any)
            .orIgnore()
            .execute();
    },

    save: async (time: Time): Promise<Time> => {
        const savedEntity = await repository.save(toTimeEntityData(time) as any);
        return fromTimeEntity(savedEntity);
    }
});

export const defaultTimeStorePort: TimeStorePort = createTimeStoreFromRepository(timeRepository);

export const defaultTimeTransactionPort: TimeTransactionPort = {
    runInTransaction: async <T>(operation: (store: TimeStorePort) => Promise<T>): Promise<T> => {
        return appDataSource.transaction(async (manager: EntityManager) => {
            const transactionalRepository = manager.getRepository<TimeEntityData>(TimeEntity);
            const transactionalStore = createTimeStoreFromRepository(transactionalRepository);
            return operation(transactionalStore);
        });
    }
};

export const defaultTimeEventsPort: TimeEventsPort = {
    emitTimeChanged: (time: Time): void => {
        eventNotifications.emit("time.changed", time);
    }
};
