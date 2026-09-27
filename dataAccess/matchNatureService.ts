import MatchNature from "../domainCore/MatchNature";
import { MatchNatureStorePort, MatchNatureTransactionPort } from "./ports/matchNaturePorts";

/**
 * Saves a MatchNature to the database.
 */
export const saveMatchNature = async (matchNature: MatchNature): Promise<MatchNature> => {
    return getConfiguredMatchNatureService().saveMatchNature(matchNature);
};

/**
 * Finds a MatchNature by its ID.
 */
export const findMatchNatureById = async (id: number): Promise<MatchNature | null> => {
    return getConfiguredMatchNatureService().findMatchNatureById(id);
};

/**
 * Finds all MatchNatures associated with a specific match ID.
 */
export const findMatchNaturesByMatchId = async (matchId: number): Promise<MatchNature[]> => {
    return getConfiguredMatchNatureService().findMatchNaturesByMatchId(matchId);
};

/**
 * Saves multiple MatchNatures in a batch operation.
 */
export const saveMatchNaturesInBatch = async (matchNatures: MatchNature[]): Promise<void> => {
    return getConfiguredMatchNatureService().saveMatchNaturesInBatch(matchNatures);
};

export type MatchNatureServicePorts = {
    matchNatureStore: MatchNatureStorePort;
    matchNatureTransaction: MatchNatureTransactionPort;
}

export const createMatchNatureService = ({ matchNatureStore, matchNatureTransaction }: MatchNatureServicePorts) => ({
    saveMatchNature: async (matchNature: MatchNature): Promise<MatchNature> => {
        return matchNatureStore.save(matchNature);
    },

    findMatchNatureById: async (id: number): Promise<MatchNature | null> => {
        return matchNatureStore.findById(id);
    },

    findMatchNaturesByMatchId: async (matchId: number): Promise<MatchNature[]> => {
        return matchNatureStore.findByMatchId(matchId);
    },

    saveMatchNaturesInBatch: async (matchNatures: MatchNature[]): Promise<void> => {
        await matchNatureTransaction.runInTransaction(async (transactionalStore) => {
            await transactionalStore.saveMatchNatures(matchNatures);
        });
    }
});

type MatchNatureService = ReturnType<typeof createMatchNatureService>;

let matchNatureService: MatchNatureService | null = null;

export const configureMatchNatureService = (ports: MatchNatureServicePorts): void => {
    matchNatureService = createMatchNatureService(ports);
}

export const getConfiguredMatchNatureService = (): MatchNatureService => {
    if (!matchNatureService) {
        throw new Error("MatchNatureService has not been configured.");
    }
    return matchNatureService;
};