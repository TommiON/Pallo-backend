import Tactics from "../domainCore/Tactics";
import { TacticsStorePort, TacticsTransactionPort } from "./ports/tacticsPorts";

/**
 * Saves a Tactics aggregate to the database.
 */
export const saveTactics = async (tactics: Tactics): Promise<Tactics> => {
    return getConfiguredTacticsService().saveTactics(tactics);
};

/**
 * Finds a Tactics aggregate by its ID.
 */
export const findTacticsById = async (id: number): Promise<Tactics | null> => {
    return getConfiguredTacticsService().findTacticsById(id);
};

export type TacticsServicePorts = {
    tacticsStore: TacticsStorePort;
    tacticsTransaction: TacticsTransactionPort;
};

export const createTacticsService = ({ tacticsStore, tacticsTransaction }: TacticsServicePorts) => ({
    saveTactics: async (tactics: Tactics): Promise<Tactics> => {
        return tacticsTransaction.runInTransaction(async (transactionalStore) => {
            return transactionalStore.save(tactics);
        });
    },

    findTacticsById: async (id: number): Promise<Tactics | null> => {
        return tacticsStore.findById(id);
    }
});

type TacticsService = ReturnType<typeof createTacticsService>;

let tacticsService: TacticsService | null = null;

export const configureTacticsService = (ports: TacticsServicePorts): void => {
    tacticsService = createTacticsService(ports);
};

const getConfiguredTacticsService = (): TacticsService => {
    if (!tacticsService) {
        throw new Error("TacticsService has not been configured.");
    }

    return tacticsService;
};