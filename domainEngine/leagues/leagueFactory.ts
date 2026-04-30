import League from "../../domainModel/league/League";
import { LEAGUE_NUMBER_OF_TEAMS } from "../../domainProperties/domainProperties"
import { findLeaguesBySeason } from "../../services/leagueService";
import { findNonAttachedUserClubs } from "../../services/clubService";
import { promoteAndRelegate } from "./promotorRelegator";
import { expandPyramid } from "./pyramidExpander";
import { persistSeasonTransition } from "../../services/leagueService";

/** This module is responsible for creating leagues for a given season. */
export const createLeaguesForSeason = async (season: number) => {
    let newLeagues: League[] = [];

    const leaguesLastSeason = await findLeaguesBySeason(season - 1);
    if (leaguesLastSeason.length > 0) {
        newLeagues = promoteAndRelegate(leaguesLastSeason);
        leaguesLastSeason.forEach(league => { league.finished = true; });
    }

    const clubsOnWaitingList = await findNonAttachedUserClubs(season);
    if (clubsOnWaitingList.length >= LEAGUE_NUMBER_OF_TEAMS) {
        newLeagues = expandPyramid(newLeagues, clubsOnWaitingList);
    }

    // const persistedLeagues = await persistSeasonTransition(leaguesLastSeason, newLeagues);

    // generate fixtures
}