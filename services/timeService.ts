import Time from "../domainModel/time/Time";
import { timeRepository } from "../persistence/repositories/repositories";
import type { TimeEntityData } from "../persistence/entities/TimeEntity";

/**
 * Gets the current time from the database.
 * @returns 
 */
export const getCurrentTime = async (): Promise<TimeEntityData|null> => {
    return await timeRepository.findOne({ where: { id: 1 } });
}

/**
 * Initializes the starting point of time in the database, if not initialized already.
 * @returns 
 */
export const initializeTime = async (): Promise<Time> => {
    const existingTimeEntity = await getCurrentTime();

    if (existingTimeEntity) {
        // Convert entity to domain object
        return Time.fromEntity(existingTimeEntity);
    } else {
        const time = new Time();
        // Convert domain object to entity for persistence
        // TypeORM repository typing is complex with entity schema changes, using cast as temporary solution
        return await timeRepository.save(time.toEntity() as any)
            .then(savedEntity => Time.fromEntity(savedEntity));
    }
}

/**
 * Updates time in the database
 * @param timeUpdate 
 * @returns 
 */
export const advanceTime = async (): Promise<Time> => {
    let oldtime = await getCurrentTime();

    if (!oldtime) {
        throw new Error("Time not initialized");
    }

    // Create a proper Time instance from the database entity
    const timeInstance = Time.fromEntity(oldtime);

    const newtime = timeInstance.advanceByAnHour();
    newtime.notifyTimeChange();

    // Convert domain object back to entity for persistence
    // TypeORM repository typing is complex with entity schema changes, using cast as temporary solution
    return await timeRepository.save(newtime.toEntity() as any);
}