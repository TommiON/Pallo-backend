import League from "../../domainModel/league/League";
import { LEAGUE_NUMBER_OF_TEAMS, LEAGUE_SPAN_FACTOR } from "../../domainProperties/domainProperties";

export type PyramidExpansionResult = {
    newLeagues: League[];
    remainingClubsOnWaitingList: number[];
}

// Luodaan sen verran liigoja kuin saadaan täyteen, ylijäävät joutuvat odottamaan seuraavaa kautta. Muutetaan sitten kun saadaan zombiet toteutettua.
export const expandPyramid = (leagues: League[], clubsOnWaitingList: number[], season: number): League[] => {
    const numberOfNewLeagues = Math.floor(clubsOnWaitingList.length / LEAGUE_NUMBER_OF_TEAMS);
    let newLeagues: League[] = [];

    // luodaan aluksi kursori, joka ensimmäisessä vapaassa kohdassa pyramidia

    for (let i = 0; i < numberOfNewLeagues; i++) {
        // tarvitaan parent-league johon kiinnitetään

        // luodaan oikeasti servicen kautta
        // const newLeague = new League();

        // newLeagues.push(newLeague);

        // popataan odotuslistalta
    }

    // iteroidaan newLeagues ja lisätään pyramidin pohjille

    const lowestDivisionLevel = leagues.reduce((max, league) => Math.max(max, league.divisionLevel), 0);


    // näitä tuskin tarvitaan jos mennään iteraatiopohjaisesti
    const numberOfLeaguesOnLowestLevel = leagues.filter(league => league.divisionLevel === lowestDivisionLevel).length;

    return leagues.concat(newLeagues); // placeholder
}

type PyramidPosition = {
    divisionLevel: number;
    serialNumberOnDivisionLevel: number;
    parentLeague?: League;
}

const nextVacantPositionInPyramid = (leagues: League[]): PyramidPosition => {
    const lowestDivisionLevel = findLowestDivionLevel(leagues);

    if (lowestDivisionLevel === null) {
        return { 
            divisionLevel: 0, 
            serialNumberOnDivisionLevel: 0 
        }; 
    }

    if (isCapacityLeftOnDivisionLevel(leagues, lowestDivisionLevel)) {
        return { 
            divisionLevel: lowestDivisionLevel, 
            serialNumberOnDivisionLevel: findHighestSerialNumberOnDivisionLevel(leagues, lowestDivisionLevel) + 1 
        };
    } else {
        return {
            divisionLevel: lowestDivisionLevel + 1, 
            serialNumberOnDivisionLevel: 0 
        };
    }
}

const firstLeagueWithVacantChildPosition = (leagues: League[]): League | null => {
    const lowestDivisionLevel = findLowestDivionLevel(leagues);

    if (lowestDivisionLevel === null) { return null; }

    const sortLeaguesByDivisionLevelAndSerialNumber = (a: League, b: League): number => {
        if (a.divisionLevel !== b.divisionLevel) { return a.divisionLevel - b.divisionLevel; }

        return a.serialNumberOnDivisionLevel - b.serialNumberOnDivisionLevel;
    }

    const childCount = (league: League): number => leagues.filter(l => l.promotesToId === league.id).length;

    return leagues
        .sort(sortLeaguesByDivisionLevelAndSerialNumber)
        .find(league => league.id !== undefined && childCount(league) < LEAGUE_SPAN_FACTOR) ?? null;
}

const addLeagueToPyramid = (newLeague: League, fromParent: League | null, leagues: League[]): void => {

}

const findLowestDivionLevel = (leagues: League[]): number | null => {
    if (leagues.length === 0) { return null; }

    return leagues.reduce((max, league) => Math.max(max, league.divisionLevel), 0);
}

const findHighestSerialNumberOnDivisionLevel = (leagues: League[], divisionLevel: number): number => {
    return leagues.filter(league => league.divisionLevel === divisionLevel)
        .reduce((max, league) => Math.max(max, league.serialNumberOnDivisionLevel), 0);
}

const isCapacityLeftOnDivisionLevel = (leagues: League[], divisionLevel: number): boolean => { 
    const capacityOfDivisionLevel = Math.pow(LEAGUE_SPAN_FACTOR, divisionLevel);
    return findHighestSerialNumberOnDivisionLevel(leagues, divisionLevel) < capacityOfDivisionLevel;    
}




