import Time from "../domainModel/time/Time";
import { timeRepository } from "../persistence/repositories/repositories";
import { LEAGUE_NUMBER_OF_TEAMS } from "../domainProperties/domainProperties";

// Itse asiassa kaikki aikalogiikka domainObjectin hommia ja tänne vain tietokantaliikenne?

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

interface TimeUpdate {
    nextSeason?: boolean;
    nextWeek?: boolean;
    nextDay?: boolean;
    nextHour?: boolean;
}

const weeksInSeason = (LEAGUE_NUMBER_OF_TEAMS - 1) * 2;

/**
 * Updates some aspect of time in the database
 * @param timeUpdate 
 * @returns 
 */
export const advanceTime = async (timeUpdate: TimeUpdate): Promise<Time> => {
    let time = await getCurrentTime();
    
    if (!time) {
        throw new Error("Time not initialized");
    }

    if (timeUpdate.nextSeason) {
        time.season += 1;
        time.week = 1;
        time.day = 1;
        time.hour = 0;
    }

    // jne.

    return await timeRepository.save(time);
}