import League from "../../domainModel/league/League";
import { LEAGUE_NUMBER_OF_TEAMS } from "../../domainProperties/domainProperties";

// Luodaan sen verran liigoja kuin saadaan täyteen, ylijäävät joutuvat odottamaan seuraavaa kautta.
// Muutetaan sitten kun saadaan zombiet toteutettua.
export const expandPyramid = (leagues: League[], clubsOnWaitingList: number[]): League[] => {
    const numberOfNewLeagues = Math.floor(clubsOnWaitingList.length / LEAGUE_NUMBER_OF_TEAMS);
    let newLeagues: League[] = [];

    for (let i = 0; i < numberOfNewLeagues; i++) {
        // luodaan uudet League-oliot listaan
    }

    // iteroidaan newLeagues ja lisätään pyramidin pohjille

    const lowestDivisionLevel = leagues.reduce((max, league) => Math.max(max, league.divisionLevel), 0);


    // näitä tuskin tarvitaan jos mennään iteraatiopohjaisesti
    const numberOfLeaguesOnLowestLevel = leagues.filter(league => league.divisionLevel === lowestDivisionLevel).length;

    return leagues.concat(newLeagues); // placeholder
}