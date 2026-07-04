import MatchEvent from "../domainCore/MatchEvent";
import { MatchEventStorePort, MatchEventTransactionPort } from "./ports/matchEventPorts";

/**
 * Saves a MatchEvent to the database.
 */
export const saveMatchEvent = async (matchEvent: MatchEvent): Promise<MatchEvent> => {
    return getConfiguredMatchEventService().saveMatchEvent(matchEvent);
};

/**
 * Finds a MatchEvent by its ID.
 */
export const findMatchEventById = async (id: number): Promise<MatchEvent | null> => {
    return getConfiguredMatchEventService().findMatchEventById(id);
};

/**
 * Finds MatchEvents by the Match ID.
 */
export const findMatchEventsByMatchId = async (matchId: number): Promise<MatchEvent[]> => {
    return getConfiguredMatchEventService().findMatchEventsByMatchId(matchId);
};

/**
 * Saves multiple MatchEvents in a batch.
 */
export const saveMatchEventsInBatch = async (matchEvents: MatchEvent[]): Promise<void> => {
    return getConfiguredMatchEventService().saveMatchEventsInBatch(matchEvents);
};


export type MatchEventServicePorts = {
    matchEventStore: MatchEventStorePort;
    matchEventTransaction: MatchEventTransactionPort;
}

export const createMatchEventService = ({ matchEventStore, matchEventTransaction }: MatchEventServicePorts) => ({
    saveMatchEvent: async (matchEvent: MatchEvent): Promise<MatchEvent> => {
        return matchEventStore.save(matchEvent);
    },

    findMatchEventById: async (id: number): Promise<MatchEvent | null> => {
        return matchEventStore.findById(id);
    },

    findMatchEventsByMatchId: async (matchId: number): Promise<MatchEvent[]> => {
        return matchEventStore.findByMatchId(matchId);
    },

    saveMatchEventsInBatch: async (matchEvents: MatchEvent[]): Promise<void> => {
        await matchEventTransaction.runInTransaction(async (transactionalStore) => {
            await transactionalStore.saveMatchEvents(matchEvents);
        });
    }
});

type MatchEventService = ReturnType<typeof createMatchEventService>;

let matchEventService: MatchEventService | null = null;

export const configureMatchEventService = (ports: MatchEventServicePorts): void => {
    matchEventService = createMatchEventService(ports);
};

const getConfiguredMatchEventService = (): MatchEventService => {
    if (!matchEventService) {
        throw new Error("MatchEventService has not been configured.");
    }
    return matchEventService;
};