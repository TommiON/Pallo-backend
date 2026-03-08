import Time from "../domainModel/time/Time";
import { timeRepository } from "../persistence/repositories/repositories";
import { LEAGUE_NUMBER_OF_TEAMS } from "../domainProperties/domainProperties";

/**
 * Gets the current time from the database.
 * @returns 
 */
export const getCurrentTime = async (): Promise<Time|null> => {
    return await timeRepository.findOne({ where: { id: 1 } });
}

/**
 * Initializes the staring point of time in the database, if not initialized already.
 * @returns 
 */
export const initializeTime = async (): Promise<Time> => {
    const existingTime = await getCurrentTime();

    if (existingTime) {
        return existingTime;
    } else {
        const time = new Time();
        time.season = 1;
        time.week = 1;
        time.day = 1;
        time.hour = 0;

        return await timeRepository.save(time);
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

    return await timeRepository.save(newtime);
}