import League from "../domainModel/league/League";
import appDataSource from "../config/datasource";
import { getTransactionalRepositories, leagueRepository } from "../persistence/repositories/repositories";

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
    const divisionLevel = spanningFrom ? spanningFrom.divisionLevel + 1 : 1;
    const promotesTo = spanningFrom ? spanningFrom : null;
    const serialNumber = previousSeasonPredecessor ? previousSeasonPredecessor.serialNumberOnDivisionLevel : serialNumberOnDivisionLevel;

    const league = new League(season, divisionLevel, serialNumber!, promotesTo);
    const savedLeagueEntity = await leagueRepository.save(league.toEntity() as any);
    const savedLeague = League.fromEntity(savedLeagueEntity);

    return savedLeague;
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
    return appDataSource.transaction(async (manager) => {
        const { leagueRepository } = getTransactionalRepositories(manager);

        for (const league of previousSeasonLeagues) {
            await leagueRepository.save(league.toEntity() as any);
        }

        const sortedNewLeagues = [...newSeasonLeagues].sort((a, b) => {
            if (a.divisionLevel !== b.divisionLevel) {
                return a.divisionLevel - b.divisionLevel;
            }

            return a.serialNumberOnDivisionLevel - b.serialNumberOnDivisionLevel;
        });

        const oldToSaved = new Map<League, League>();

        for (const league of sortedNewLeagues) {
            const entity = league.toEntity();
            delete entity.id;

            if (league.promotesTo) {
                const savedParent = oldToSaved.get(league.promotesTo);
                if (!savedParent || savedParent.id === undefined) {
                    throw new Error("Parent league must be saved before child league");
                }
                entity.promotesToId = savedParent.id;
            } else {
                entity.promotesToId = undefined;
            }

            const savedLeagueEntity = await leagueRepository.save(entity as any);
            const savedLeague = League.fromEntity(savedLeagueEntity);

            const clubIds = (league.clubs ?? [])
                .map((club) => club.id)
                .filter((id): id is number => id !== undefined);

            if (clubIds.length > 0 && savedLeague.id !== undefined) {
                await manager
                    .createQueryBuilder()
                    .relation("league", "clubs")
                    .of(savedLeague.id)
                    .add(clubIds);
            }

            savedLeague.clubs = league.clubs;
            savedLeague.promotesTo = league.promotesTo ? oldToSaved.get(league.promotesTo) ?? null : null;
            oldToSaved.set(league, savedLeague);
        }

        return newSeasonLeagues
            .map((league) => oldToSaved.get(league))
            .filter((league): league is League => league !== undefined);
    });
}

/** Finds all leagues for a given season */
export const findLeaguesBySeason = async (season: number): Promise<League[]> => {
    const leagueEntities = await leagueRepository.find({
        where: { season }
    });

    return leagueEntities.map(entity => League.fromEntity(entity));
}

/** Finds a league by season number and divisional position (division level and serial number on that division level) */
export const findLeagueBySeasonAndDivionalPosition = async (
        season: number,
        divisionLevel: number,
        serialNumberOnDivisionLevel: number
): Promise<League|null> => {
    const leagueEntity = await leagueRepository.findOne({
        where: {
            season,
            divisionLevel,
            serialNumberOnDivisionLevel
        }
    });

    return leagueEntity ? League.fromEntity(leagueEntity) : null;
}

/** Returns the children Leagues for a given league (i.e., Leagues that promote to the given League) */
export const findChildrenForLeague = async (leagueId: number): Promise<League[]> => {
    const leagueEntities = await leagueRepository.find({
        where: { promotesToId: leagueId }
    });

    return leagueEntities.map(entity => League.fromEntity(entity));
}

// funktio jolla vaihdetaan kahden seuran paikka (promotion/relegation)
