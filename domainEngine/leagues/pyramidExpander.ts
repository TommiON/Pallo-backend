import League from "../../domainModel/league/League";
import { LEAGUE_NUMBER_OF_TEAMS, LEAGUE_SPAN_FACTOR } from "../../domainProperties/domainProperties";

/* tätä ei varmaan tarvita
export type PyramidExpansionResult = {
    newLeagues: League[];
    remainingClubsOnWaitingList: number[];
}
    */

// Luodaan sen verran liigoja kuin saadaan täyteen, ylijäävät joutuvat odottamaan seuraavaa kautta. Muutetaan sitten kun saadaan zombiet toteutettua.
export const expandPyramid = (leagues: League[], clubsOnWaitingList: number[], season: number): League[] => {
    // lasketaan moneenko uuteen liigaan riittää odottajia
    const numberOfNewLeagues = Math.floor(clubsOnWaitingList.length / LEAGUE_NUMBER_OF_TEAMS);

    // iteroidaan uudet (tässä vaiheessa tyhjät) liigat
    for (let i = 0; i < numberOfNewLeagues; i++) {
        // firstLeagueWithVacantChildPosition(leagues) etsii ensimmäisen vapaan paikan
        // jos ei löydy, pitää luoda uusi taso, miten tässä tapauksessa promotesTo-vanhempi?
        // popataan odotulistalta liigan kokokoinen siivu (tälle funktio)
        // jotain jotain...
        // concataaan uusi liiga vanhojen jatkoksi
    }

    // iteroinnin jälkeen palautetaan, odotuslistalle jääneille ylijäämille ei sinänsä tarvitse tehdä mitään?

    const lowestDivisionLevel = leagues.reduce((max, league) => Math.max(max, league.divisionLevel), 0);


    // näitä tuskin tarvitaan jos mennään iteraatiopohjaisesti
    const numberOfLeaguesOnLowestLevel = leagues.filter(league => league.divisionLevel === lowestDivisionLevel).length;

    // placeholder
    return [];
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

const sliceClubsForLeaguePlacement = (clubsOnWaitingList: number[]): number[][] => {
    const numberOfFullLeagues = Math.floor(clubsOnWaitingList.length / LEAGUE_NUMBER_OF_TEAMS);
    const clubsForLeaguePlacement = clubsOnWaitingList.slice(0, numberOfFullLeagues * LEAGUE_NUMBER_OF_TEAMS);

    const chunks: number[][] = [];

    for (let i = 0; i < clubsForLeaguePlacement.length; i += LEAGUE_NUMBER_OF_TEAMS) {
        chunks.push(clubsForLeaguePlacement.slice(i, i + LEAGUE_NUMBER_OF_TEAMS));
    }

    return chunks;
}

const addLeagueToPyramid = (newLeague: League, fromParent: League | null, clubs: number[],existingLeagues: League[]): void => {

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




