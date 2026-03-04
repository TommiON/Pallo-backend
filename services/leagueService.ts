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

    const league = new League(season, divisionLevel, serialNumber, promotesTo);
    const savedLeague = await leagueRepository.save(league);
}

/**
 * Finds a league by season number and divisional position (division level and serial number on that division level)
 * @param season 
 * @param divisionLevel 
 * @param serialNumberOnDivisionLevel 
 */
const findLeagueBySeasonAndDivionalPosition = async (
        season: number,
        divisionLevel: number,
        serialNumberOnDivisionLevel: number
): Promise<League|null> => {
    return null;
}


const findChildrenForLeague = async (leagueId: number): Promise<League[] | null> => {

}

// funktio jolla vaihdetaan kahden seuran paikka (promotion/relegation)
