import League from "../domainCore/League";
import { LeagueStorePort, LeagueTransactionPort } from "./ports/leaguePorts";

/**
 * Creates a new league for the given season
 * @param season number of the upcoming season
 * @param spanningFrom upper league, i.e. target of the promotesTo
 * @param previousSeasonPredecessor 
 * @param serialNumberOnDivisionLevel needed if previousSeasonPredecessor is null, i.e. there was no League in the previous season at
 * this position of the pyramid
 */
export const createLeague = async (
        season: number,
        spanningFrom: League | null,
        previousSeasonPredecessor: League | null,
        serialNumberOnDivisionLevel: number | null
): Promise<League> => {
    return getConfiguredLeagueService().createLeague(
        season,
        spanningFrom,
        previousSeasonPredecessor,
        serialNumberOnDivisionLevel
    );
}

/**
 * Persists season transition atomically:
 * - saves previous season leagues with their current state (caller is responsible for marking them finished)
 * - inserts new season leagues parent-first
 * - persists league-club memberships for inserted leagues
 */
export const persistSeasonTransition = async (
        previousSeasonLeagues: League[],
        newSeasonLeagues: League[]
): Promise<League[]> => {
    return getConfiguredLeagueService().persistSeasonTransition(previousSeasonLeagues, newSeasonLeagues);
}

/** 
 * Finds all leagues for a given season 
 */
export const findLeaguesBySeason = async (season: number): Promise<League[]> => {
    return getConfiguredLeagueService().findLeaguesBySeason(season);
}

/** 
 * Finds a league by season number and divisional position (division level and serial number on that division level) 
 */
export const findLeagueBySeasonAndDivionalPosition = async (
        season: number,
        divisionLevel: number,
        serialNumberOnDivisionLevel: number
): Promise<League|null> => {
    return getConfiguredLeagueService().findLeagueBySeasonAndDivionalPosition(
        season,
        divisionLevel,
        serialNumberOnDivisionLevel
    );
}

/** 
 * Returns the children Leagues for a given league (i.e., Leagues that promote to the given League) 
 */
export const findChildrenForLeague = async (leagueId: number): Promise<League[]> => {
    return getConfiguredLeagueService().findChildrenForLeague(leagueId);
}


export type LeagueServicePorts = {
    leagueStore: LeagueStorePort;
    leagueTransaction: LeagueTransactionPort;
};

export const createLeagueService = ({ leagueStore, leagueTransaction }: LeagueServicePorts) => ({
    createLeague: async (
        season: number,
        spanningFrom: League | null,
        previousSeasonPredecessor: League | null,
        serialNumberOnDivisionLevel: number | null
    ): Promise<League> => {
        const divisionLevel = spanningFrom ? spanningFrom.divisionLevel + 1 : 1;
        const promotesTo = spanningFrom ? spanningFrom : null;
        const serialNumber = previousSeasonPredecessor
            ? previousSeasonPredecessor.serialNumberOnDivisionLevel
            : serialNumberOnDivisionLevel;

        const league = new League(season, divisionLevel, serialNumber!, promotesTo);
        return leagueStore.save(league);
    },

    persistSeasonTransition: async (
        previousSeasonLeagues: League[],
        newSeasonLeagues: League[]
    ): Promise<League[]> => {
        return leagueTransaction.runInTransaction(async (transactionalStore) => {
            for (const league of previousSeasonLeagues) {
                await transactionalStore.save(league);
            }

            const sortedNewLeagues = [...newSeasonLeagues].sort((a, b) => {
                if (a.divisionLevel !== b.divisionLevel) {
                    return a.divisionLevel - b.divisionLevel;
                }

                return a.serialNumberOnDivisionLevel - b.serialNumberOnDivisionLevel;
            });

            const oldToSaved = new Map<League, League>();

            for (const league of sortedNewLeagues) {
                const previousPromotesTo = league.promotesTo;

                if (league.promotesTo) {
                    const savedParent = oldToSaved.get(league.promotesTo);
                    if (!savedParent || savedParent.id === undefined) {
                        throw new Error("Parent league must be saved before child league");
                    }
                } else {
                    league.promotesTo = null;
                }

                const unsavedId = league.id;
                if (league.promotesTo) {
                    const savedParent = oldToSaved.get(league.promotesTo);
                    league.promotesTo = savedParent ?? null;
                }
                league.id = undefined;
                const savedLeague = await transactionalStore.save(league);
                league.id = unsavedId;
                league.promotesTo = previousPromotesTo;

                const clubIds = (league.clubs ?? [])
                    .map((club) => club.id)
                    .filter((id): id is number => id !== undefined);

                if (clubIds.length > 0 && savedLeague.id !== undefined) {
                    await transactionalStore.addClubsToLeague(savedLeague.id, clubIds);
                }

                savedLeague.clubs = league.clubs;
                savedLeague.promotesTo = league.promotesTo ? oldToSaved.get(league.promotesTo) ?? null : null;
                oldToSaved.set(league, savedLeague);
            }

            return newSeasonLeagues
                .map((league) => oldToSaved.get(league))
                .filter((league): league is League => league !== undefined);
        });
    },

    findLeaguesBySeason: async (season: number): Promise<League[]> => {
        return leagueStore.findBySeason(season);
    },

    findLeagueBySeasonAndDivionalPosition: async (
        season: number,
        divisionLevel: number,
        serialNumberOnDivisionLevel: number
    ): Promise<League | null> => {
        return leagueStore.findBySeasonAndDivisionalPosition(
            season,
            divisionLevel,
            serialNumberOnDivisionLevel
        );
    },

    findChildrenForLeague: async (leagueId: number): Promise<League[]> => {
        return leagueStore.findChildrenForLeague(leagueId);
    }
});

type LeagueService = ReturnType<typeof createLeagueService>;

let leagueService: LeagueService | null = null;

export const configureLeagueService = (ports: LeagueServicePorts): void => {
    leagueService = createLeagueService(ports);
};

const getConfiguredLeagueService = (): LeagueService => {
    if (!leagueService) {
        throw new Error("League service not configured");
    }

    return leagueService;
};