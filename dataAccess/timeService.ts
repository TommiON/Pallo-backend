import Time from "../domainCore/Time";
import { TimeEventsPort, TimeStorePort, TimeTransactionPort } from "./ports/timePorts";

/**
 * Gets the current time from the database.
 */
export const getCurrentTime = async (): Promise<Time|null> => {
    return getConfiguredTimeService().getCurrentTime();
}

/**
 * Initializes the starting point of time in the database, if not initialized already.
 */
export const initializeTime = async (): Promise<Time> => {
    return getConfiguredTimeService().initializeTime();
}

/**
 * Updates time in the database
 */
export const updateTime = async (updatedTime: Time): Promise<Time> => {
    return getConfiguredTimeService().updateTime(updatedTime);
}


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

    updateTime: async (updatedTime: Time): Promise<Time> => {
        const savedTime = await timeTransaction.runInTransaction(async (transactionalStore) => {
            return transactionalStore.save(updatedTime);
        });

        timeEvents.emitTimeChanged(savedTime);
        return savedTime;
    }
});

type TimeService = ReturnType<typeof createTimeService>;

let timeService: TimeService | null = null;

export const configureTimeService = (ports: TimeServicePorts): void => {
    timeService = createTimeService(ports);
};

const getConfiguredTimeService = (): TimeService => {
    if (!timeService) {
        throw new Error("Time service not configured");
    }

    return timeService;
};