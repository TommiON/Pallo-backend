import League from "../../domainCore/league/League";
import { LEAGUE_NUMBER_OF_TEAMS } from "../../domainProperties/domainProperties"
import { findLeaguesBySeason } from "../../dataAccess/leagueService";
import { findNonAttachedUserClubs } from "../../dataAccess/clubService";
import { promoteAndRelegate } from "./promotorRelegator";
import { expandPyramid } from "./pyramidExpander";
import { persistSeasonTransition } from "../../dataAccess/leagueService";

/** This module is responsible for creating leagues for a given season. */
export const createLeaguesForSeason = async (season: number) => {
    let leagues: League[] = [];

    // Fetch leagues from last season (if any).

    const leaguesLastSeason = await findLeaguesBySeason(season - 1);

    // Last season ends... Promote and relegate, and mark last season's leagues as finished.

    if (leaguesLastSeason.length > 0) {
        leagues = promoteAndRelegate(leaguesLastSeason);
        
        leaguesLastSeason.forEach(league => { league.finished = true; });
    }

    // New season begins...
    // Expand pyramid if there are enough clubs on the waiting list; for the first season, this will create the initial leagues.

    leagues.forEach(league => { league.season = season; });

    const clubsOnWaitingList = await findNonAttachedUserClubs(season - 1);

    if (clubsOnWaitingList.length >= LEAGUE_NUMBER_OF_TEAMS) {
        leagues = expandPyramid(leagues, clubsOnWaitingList, season);
    }

    // Generate fixtures.

    // Mark leagues as started.

    leagues.forEach(league => { league.started = true; });

    // Persist changes to database.

    await persistSeasonTransition(leaguesLastSeason, leagues);
}