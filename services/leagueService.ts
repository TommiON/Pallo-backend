import League from "../domainModel/league/League";
import Club from "../domainModel/club/Club";
import { leagueRepository } from "../persistence/repositories/repositories";

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
