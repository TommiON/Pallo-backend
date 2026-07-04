import Match from "../domainCore/Match";
import { MatchStorePort, MatchTransactionPort } from "./ports/matchPorts";

/**
 * Saves a single match to the database. If the save operation fails, an error is thrown.
 */
export const saveMatch = async (match: Match): Promise<Match> => {
    return getConfiguredMatchService().saveMatch(match);
};

/**
 * Saves multiple matches in a single transaction. If any of the matches fail to save, the entire transaction is rolled back.
 */
export const saveMatchesInBatch = async (matches: Match[]): Promise<void> => {
    return getConfiguredMatchService().saveMatchesInBatch(matches);
};

/**
 * Finds a match by its ID.
 */
export const findMatchById = async (id: number): Promise<Match | null> => {
    return getConfiguredMatchService().findMatchById(id);
};

/**
 * Finds a match by the ID of the League the Match it is part of.
 */
export const findMatchesByLeagueId = async (leagueId: number): Promise<Match[]> => {
    return getConfiguredMatchService().findMatchesByLeagueId(leagueId);
};

/**
 * Finds matches by the ID of the Leaguet the Match it is part of, and week number.
 */
export const findMatchesByLeagueIdAndWeek = async (leagueId: number, week: number): Promise<Match[]> => {
    return getConfiguredMatchService().findMatchesByLeagueIdAndWeek(leagueId, week);
};

/**
 * Finds matches by the season and week number.
 */
export const findMatchesBySeasonAndWeek = async (season: number, week: number): Promise<Match[]> => {
    return getConfiguredMatchService().findMatchesBySeasonAndWeek(season, week);
};


export type MatchServicePorts = {
    matchStore: MatchStorePort;
    matchTransaction: MatchTransactionPort;
};

export const createMatchService = ({ matchStore, matchTransaction }: MatchServicePorts) => ({
    saveMatch: async (match: Match): Promise<Match> => {
        return matchStore.save(match);
    },

    saveMatchesInBatch: async (matches: Match[]): Promise<void> => {
        await matchTransaction.runInTransaction(async (transactionalStore) => {
            await transactionalStore.saveMatches(matches);
        });
    },
    
    findMatchById: async (id: number): Promise<Match | null> => {
        return matchStore.findById(id);
    },

    findMatchesByLeagueId: async (leagueId: number): Promise<Match[]> => {
        return matchStore.findByLeagueId(leagueId);
    },

    findMatchesByLeagueIdAndWeek: async (leagueId: number, week: number): Promise<Match[]> => {
        return matchStore.findByLeagueIdAndWeek(leagueId, week);
    },

    findMatchesBySeasonAndWeek: async (season: number, week: number): Promise<Match[]> => {
        return matchStore.findBySeasonAndWeek(season, week);
    }
});

type MatchService = ReturnType<typeof createMatchService>;

let matchService: MatchService | null = null;

export const configureMatchService = (ports: MatchServicePorts): void => {
    matchService = createMatchService(ports);
};

const getConfiguredMatchService = (): MatchService => {
    if (!matchService) {
        throw new Error("Match service not configured");
    }

    return matchService;
}