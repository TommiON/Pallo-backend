import League from "../../domainModel/league/League";
import { LEAGUE_NUMBER_OF_TEAMS } from "../../domainProperties/domainProperties"
import { findLeaguesBySeason } from "../../services/leagueService";
import { findNonAttachedUserClubs } from "../../services/clubService";
import { promoteAndRelegate } from "./promotorRelegator";
import { expandPyramid } from "./pyramidExpander";
import { persistSeasonTransition } from "../../services/leagueService";

/** This module is responsible for creating leagues for a given season. */
export const createLeaguesForSeason = async (season: number) => {
    let leagues: League[] = [];

    // Fetch leagues from last season (if any).

    const leaguesLastSeason = await findLeaguesBySeason(season - 1);

    // Promote and relegate, and mark last season's leagues as finished.

    if (leaguesLastSeason.length > 0) {
        leagues = promoteAndRelegate(leaguesLastSeason);
        leagues.forEach(league => { league.season = season; });
        
        leaguesLastSeason.forEach(league => { league.finished = true; });
    }

    // Expand pyramid if there are enough clubs on the waiting list; for the first season, this will create the initial leagues.

    const clubsOnWaitingList = await findNonAttachedUserClubs(season);

    if (clubsOnWaitingList.length >= LEAGUE_NUMBER_OF_TEAMS) {
        leagues = expandPyramid(leagues, clubsOnWaitingList, season);
    }

    // Generate fixtures.

    // started = true

    // Persist changes to database.

    await persistSeasonTransition(leaguesLastSeason, leagues);
}