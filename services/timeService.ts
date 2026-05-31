import Time from "../domainCore/time/Time";
import { WeeklyEvent } from "../domainCore/WeeklyEvent";
import WeekRunner from "../domainEngine/runners/WeekRunner";
import { TimeEventsPort, TimeStorePort, TimeTransactionPort } from "./ports/timePorts";
import { createDefaultTimeServicePorts } from "./composition/timeServiceComposition";

export type TimeServicePorts = {
    timeStore: TimeStorePort;
    timeTransaction: TimeTransactionPort;
    timeEvents: TimeEventsPort;
};

export const createTimeService = ({ timeStore, timeTransaction, timeEvents }: TimeServicePorts) => ({
    getCurrentTime: async (): Promise<Time | null> => {
        return timeStore.getCurrent();
    },

    initializeTime: async (): Promise<Time> => {
        const time = await timeTransaction.runInTransaction(async (transactionalStore) => {
            let currentTime = await transactionalStore.getCurrentForUpdate();

            if (!currentTime) {
                await transactionalStore.insertIfMissing(new Time());
                currentTime = await transactionalStore.getCurrentForUpdate();
            }

            if (!currentTime) {
                throw new Error("Failed to initialize time singleton");
            }

            return currentTime;
        });

        timeEvents.emitTimeChanged(time);
        return time;
    },

    advanceTime: async (): Promise<Time> => {
        const updatedTime = await timeTransaction.runInTransaction(async (transactionalStore) => {
            const currentTime = await transactionalStore.getCurrentForUpdate();

            if (!currentTime) {
                throw new Error("Time not initialized");
            }

            const advancedTime = currentTime.advanceByAnHour();
            return transactionalStore.save(advancedTime);
        });

        timeEvents.emitTimeChanged(updatedTime);
        return updatedTime;
    }
});

const timeService = createTimeService(createDefaultTimeServicePorts());

/**
 * Gets the current time from the database.
 * @returns 
 */
export const getCurrentTime = async (): Promise<Time|null> => {
    return timeService.getCurrentTime();
}

/**
 * Initializes the starting point of time in the database, if not initialized already.
 * @returns 
 */
export const initializeTime = async (): Promise<Time> => {
    return timeService.initializeTime();
}

/**
 * Updates time in the database
 * @param timeUpdate 
 * @returns 
 */
export const advanceTime = async (): Promise<Time> => {
    return timeService.advanceTime();
}

/**
 * Gets current Weekly Events
 */
export const getWeeklyEvents = (): WeeklyEvent[] => {
    return WeekRunner.getEvents();
}