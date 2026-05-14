import League from "../../domainModel/league/League";
import { LEAGUE_NUMBER_OF_TEAMS } from "../../domainProperties/domainProperties";

// Luodaan sen verran liigoja kuin saadaan täyteen, ylijäävät joutuvat odottamaan seuraavaa kautta.
// Muutetaan sitten kun saadaan zombiet toteutettua.
export const expandPyramid = (leagues: League[], clubsOnWaitingList: number[], season: number): League[] => {
    const numberOfNewLeagues = Math.floor(clubsOnWaitingList.length / LEAGUE_NUMBER_OF_TEAMS);
    let newLeagues: League[] = [];

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

