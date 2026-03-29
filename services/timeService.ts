import Time from "../domainModel/time/Time";
import { timeRepository } from "../persistence/repositories/repositories";
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
    let time: Time | null = await getCurrentTime();

    if (!time) {
        time = new Time();
        await timeRepository.save(time.toEntity() as any)
            .then(savedEntity => time = Time.fromEntity(savedEntity));
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
    const timeInstance = await getCurrentTime();

    if (!timeInstance) {
        throw new Error("Time not initialized");
    }

    const newtime = timeInstance.advanceByAnHour();

    // TypeORM repository typing is complex with entity schema changes, using cast as temporary solution
    const savedTime = await timeRepository.save(newtime.toEntity() as any);
    const updatedTime = Time.fromEntity(savedTime);
    eventNotifications.emit("time.changed", updatedTime);

    return updatedTime;
}

/**
 * Gets current Weekly Events
 */
export const getWeeklyEvents = (): WeeklyEvent[] => {
    return WeekRunner.getEvents();
}