import Tactics, { MatchSide } from "../domainCore/Tactics";
import { TacticsStorePort, TacticsTransactionPort } from "./ports/tacticsPorts";

/**
 * Saves or updates a tactics set scoped to a specific match and side.
 */
export const saveTactics = async (matchId: number, side: MatchSide, tactics: Tactics): Promise<Tactics> => {
    return getConfiguredTacticsService().saveTactics(matchId, side, tactics);
};

/**
 * Finds a Tactics aggregate by its match and side.
 */
export const findTacticsForMatch = async (matchId: number, side: MatchSide): Promise<Tactics | null> => {
    return getConfiguredTacticsService().findTacticsForMatch(matchId, side);
};

/**
 * Finds all tactics belonging to a match.
 */
export const findTacticsForMatchId = async (matchId: number): Promise<Tactics[]> => {
    return getConfiguredTacticsService().findTacticsForMatchId(matchId);
};

/**
 * Locks a tactics row once the match enters the historical phase.
 */
export const lockTacticsForMatch = async (matchId: number, side: MatchSide): Promise<void> => {
    return getConfiguredTacticsService().lockTacticsForMatch(matchId, side);
};

export type TacticsServicePorts = {
    tacticsStore: TacticsStorePort;
    tacticsTransaction: TacticsTransactionPort;
};

export const createTacticsService = ({ tacticsStore, tacticsTransaction }: TacticsServicePorts) => ({
    saveTactics: async (matchId: number, side: MatchSide, tactics: Tactics): Promise<Tactics> => {
        if (tactics.matchId !== matchId) {
            throw new Error(`Tactics matchId mismatch: expected ${matchId}, got ${tactics.matchId}.`);
        }

        if (tactics.side !== side) {
            throw new Error(`Tactics side mismatch: expected ${side}, got ${tactics.side}.`);
        }

        if (tactics.locked) {
            throw new Error("Cannot save locked tactics.");
        }

        return tacticsTransaction.runInTransaction(async (transactionalStore) => {
            return transactionalStore.saveForMatch(matchId, side, tactics);
        });
    },

    findTacticsForMatch: async (matchId: number, side: MatchSide): Promise<Tactics | null> => {
        return tacticsStore.findByMatchIdAndSide(matchId, side);
    },

    findTacticsForMatchId: async (matchId: number): Promise<Tactics[]> => {
        return tacticsStore.findByMatchId(matchId);
    },

    lockTacticsForMatch: async (matchId: number, side: MatchSide): Promise<void> => {
        const tactics = await tacticsStore.findByMatchIdAndSide(matchId, side);

        if (!tactics) {
            throw new Error(`No tactics found for match ${matchId} on side ${side}.`);
        }

        tactics.lock();
        await tacticsStore.saveForMatch(matchId, side, tactics);
        await tacticsStore.lockForMatch(matchId, side);
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