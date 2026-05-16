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

    // Fetch leagues from last season (if exists), promote and relegate, and mark last season's leagues as finished
    const leaguesLastSeason = await findLeaguesBySeason(season - 1);

    if (leaguesLastSeason.length > 0) {
        newLeagues = promoteAndRelegate(leaguesLastSeason);
        newLeagues.forEach(league => { league.season = season; });
        leaguesLastSeason.forEach(league => { league.finished = true; });
    }

    // Expand pyramid if there are enough clubs on the waiting list; for the first season, this will create the initial leagues
    const clubsOnWaitingList = await findNonAttachedUserClubs(season);

    if (clubsOnWaitingList.length >= LEAGUE_NUMBER_OF_TEAMS) {
        newLeagues = expandPyramid(newLeagues, clubsOnWaitingList, season);
    }

    // generate fixtures

    // started = true

    // const persistedLeagues = await persistSeasonTransition(leaguesLastSeason, newLeagues);
}