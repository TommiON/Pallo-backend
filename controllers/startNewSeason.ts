import League from "../domainCore/League";
import { LEAGUE_NUMBER_OF_TEAMS } from "../domainCore/domainProperties";
import { promoteAndRelegate } from "../domainEngine/leagues/promotorRelegator";
import { expandPyramid } from "../domainEngine/leagues/pyramidExpander";
import { persistSeasonTransition } from "../dataAccess/leagueService";
import { findLeaguesBySeason } from "../dataAccess/leagueService";
import { findNonAttachedUserClubs } from "../dataAccess/clubService";

export class NotEnoughClubsForSeasonStartError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotEnoughClubsForSeasonStartError";
    }
}

export const startNewSeason = async (season: number) => {
        await checkEnoughClubsForSeasonStart(season);

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
    
        const clubsOnWaitingList = await findNonAttachedUserClubs(getReferenceSeasonForWaitingList(season));
    
        if (clubsOnWaitingList.length >= LEAGUE_NUMBER_OF_TEAMS) {
            leagues = expandPyramid(leagues, clubsOnWaitingList, season);
        }
    
        // Generate fixtures.
    
        // Mark leagues as started.
        leagues.forEach(league => { league.started = true; });
    
        // Persist changes to database.
        await persistSeasonTransition(leaguesLastSeason, leagues);
}

const checkEnoughClubsForSeasonStart = async (season: number): Promise<void> => {
    // Tarkistetaan vain kaikkien aikojen ensimmäinen kausi. Toistaiseksi oletetaan, että kun kerran on saatu käyntiin, klubeja ei enää katoa.
    if (season !== 0) return;
    
    const clubsOnWaitingList = await findNonAttachedUserClubs(getReferenceSeasonForWaitingList(season));

    if (clubsOnWaitingList.length < LEAGUE_NUMBER_OF_TEAMS) {
        throw new NotEnoughClubsForSeasonStartError(
            `Cannot start season ${season}: requires at least ${LEAGUE_NUMBER_OF_TEAMS} clubs, have ${clubsOnWaitingList.length}.`
        );
    }
};

const getReferenceSeasonForWaitingList = (season: number): number => {
    return season === 0 ? 0 : season - 1;
};