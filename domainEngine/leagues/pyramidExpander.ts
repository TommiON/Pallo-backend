import League from "../../domainModel/league/League";
import { LEAGUE_NUMBER_OF_TEAMS, LEAGUE_SPAN_FACTOR } from "../../domainProperties/domainProperties";

// Luodaan sen verran liigoja kuin saadaan täyteen, ylijäävät joutuvat odottamaan seuraavaa kautta.
// Muutetaan sitten kun saadaan zombiet toteutettua.
export const expandPyramid = (leagues: League[], clubsOnWaitingList: number[], season: number): League[] => {
    const numberOfNewLeagues = Math.floor(clubsOnWaitingList.length / LEAGUE_NUMBER_OF_TEAMS);
    let newLeagues: League[] = [];

    // luodaan aluksi kursori, joka ensimmäisessä vapaassa kohdassa pyramidia

    for (let i = 0; i < numberOfNewLeagues; i++) {
        const newLeague = new League(
            season, // season
            0, // divisionLevel
            0, // serialNumberOnDivisionLevel
            null // promotesTo
        );

        newLeagues.push(newLeague);

        // popataan odotuslistalta
    }

    // iteroidaan newLeagues ja lisätään pyramidin pohjille

    const lowestDivisionLevel = leagues.reduce((max, league) => Math.max(max, league.divisionLevel), 0);


    // näitä tuskin tarvitaan jos mennään iteraatiopohjaisesti
    const numberOfLeaguesOnLowestLevel = leagues.filter(league => league.divisionLevel === lowestDivisionLevel).length;

    return leagues.concat(newLeagues); // placeholder
}

type PyramidCursor = {
    divisionLevel: number;
    serialNumberOnDivisionLevel: number;
}

const findStartingPositionInPyramid = (leagues: League[]): PyramidCursor => {
    if (leagues.length === 0) {
        return { divisionLevel: 0, serialNumberOnDivisionLevel: 0 };
    }

    const lowestDivisionLevel = leagues.reduce((max, league) => Math.max(max, league.divisionLevel), 0);

    if (isCapacityLeftOnDivisionLevel(leagues, lowestDivisionLevel)) {
        const highestSerialNumberOnLowestDivisionLevel = leagues
            .filter(league => league.divisionLevel === lowestDivisionLevel)
            .reduce((max, league) => Math.max(max, league.serialNumberOnDivisionLevel), 0);

        return { divisionLevel: lowestDivisionLevel, serialNumberOnDivisionLevel: highestSerialNumberOnLowestDivisionLevel + 1 };
    } else {
        return { divisionLevel: lowestDivisionLevel + 1, serialNumberOnDivisionLevel: 0 };
    }
}

export const isCapacityLeftOnDivisionLevel = (leagues: League[], divisionLevel: number): boolean => { 
    const numberOfLeaguesOnDivisionLevel = leagues.filter(league => league.divisionLevel === divisionLevel).length;

    const capacityOfDivisionLevel = Math.pow(LEAGUE_SPAN_FACTOR, divisionLevel) * LEAGUE_NUMBER_OF_TEAMS;
    return numberOfLeaguesOnDivisionLevel < capacityOfDivisionLevel;
}

