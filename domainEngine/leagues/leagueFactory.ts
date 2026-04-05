import League from "../../domainModel/league/League";
import { LEAGUE_NUMBER_OF_TEAMS } from "../../domainProperties/domainProperties"
import { findLeaguesBySeason } from "../../services/leagueService";
import { findNonAttachedUserClubs } from "../../services/clubService";
import { promoteAndRelegate } from "./promotorRelegator";

/** This module is responsible for creating leagues for a given season. */
export const createLeaguesForSeason = async (season: number) => {
    let leagues: League[] = [];

    if (season > 1) {
        const leaguesLastSeason = await findLeaguesBySeason(season - 1);
        leagues = promoteAndRelegate(leaguesLastSeason);
    }

    const clubsOnWaitingList = await findNonAttachedUserClubs(season);
    if (clubsOnWaitingList.length >= LEAGUE_NUMBER_OF_TEAMS) {
        leagues = expandPyramid(leagues, clubsOnWaitingList);
    }

    // generate fixtures
    // kirjoitetaan uudet kantaan (-> leagueService)
    // kirjoitetaan vanhat kantaan, deaktivinti (-> leagueService)


}

const expandPyramid = (leagues: League[], clubsOnWaitingList: number[]): League[] => {
    return leagues; // placeholder
}

// Luodaan sen verran liigoja kuin saadaan täyteen, ylijäävät joutuvat odottamaan seuraavaa kautta.
// Muutetaan sitten kun saadaan zombiet toteutettua.
const calculateNumberOfLeagues = (numberOfClubs: number): number => {
    return Math.floor(numberOfClubs / LEAGUE_NUMBER_OF_TEAMS);
}