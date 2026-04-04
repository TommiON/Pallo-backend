import Time from "../domainModel/time/Time";
import appDataSource from "../config/datasource";
import { timeRepository } from "../persistence/repositories/repositories";
import { getTransactionalRepositories } from "../persistence/repositories/repositories";
import { TimeEntity } from "../persistence/entities/TimeEntity";
import { WeeklyEvent } from "../domainModel/time/WeeklyEvent";
import WeekRunner from "../domainEngine/runners/WeekRunner";
import { eventNotifications } from "./eventNotifications";

/**
 * Gets the current time from the database.
 * @returns 
 */
export const getCurrentTime = async (): Promise<Time|null> => {
    const timeEntity = await timeRepository.findOne({ where: { id: 1 } });
    return timeEntity ? Time.fromEntity(timeEntity) : null;
}

/**
 * Initializes the starting point of time in the database, if not initialized already.
 * @returns 
 */
export const initializeTime = async (): Promise<Time> => {
    let time: Time | null = null;

    await appDataSource.transaction(async (manager) => {
        const { timeRepository } = getTransactionalRepositories(manager);

        let timeEntity = await timeRepository
            .createQueryBuilder("time")
            .setLock("pessimistic_write")
            .where("time.id = :id", { id: 1 })
            .getOne();

        if (!timeEntity) {
            const initialTime = new Time();

            await timeRepository
                .createQueryBuilder()
                .insert()
                .into(TimeEntity)
                .values(initialTime.toEntity() as any)
                .orIgnore()
                .execute();

            timeEntity = await timeRepository
                .createQueryBuilder("time")
                .setLock("pessimistic_write")
                .where("time.id = :id", { id: 1 })
                .getOne();
        }

        if (!timeEntity) {
            throw new Error("Failed to initialize time singleton");
        }

        time = Time.fromEntity(timeEntity);
    });

    if (!time) {
        throw new Error("Time initialization transaction did not produce a time instance");
    }

    eventNotifications.emit("time.changed", time);

    return time;
}

/**
 * Updates time in the database
 * @param timeUpdate 
 * @returns 
 */
export const advanceTime = async (): Promise<Time> => {
    let updatedTime: Time | null = null;

    await appDataSource.transaction(async (manager) => {
        const { timeRepository } = getTransactionalRepositories(manager);

        const lockedTimeEntity = await timeRepository
            .createQueryBuilder("time")
            .setLock("pessimistic_write")
            .where("time.id = :id", { id: 1 })
            .getOne();

        if (!lockedTimeEntity) {
            throw new Error("Time not initialized");
        }

        const newtime = Time.fromEntity(lockedTimeEntity).advanceByAnHour();

        // TypeORM repository typing is complex with entity schema changes, using cast as temporary solution
        const savedTime = await timeRepository.save(newtime.toEntity() as any);
        updatedTime = Time.fromEntity(savedTime);
    });

    if (!updatedTime) {
        throw new Error("Time advance transaction did not produce an updated time");
    }

    eventNotifications.emit("time.changed", updatedTime);

    return updatedTime;
}

/**
 * Gets current Weekly Events
 */
export const getWeeklyEvents = (): WeeklyEvent[] => {
    return WeekRunner.getEvents();
}