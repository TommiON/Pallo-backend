import { resolveMatch } from "../domainEngine/matches/MatchResolver";
import { findMatchesBySeasonAndWeek, saveMatch, saveMatchesInBatch } from "../dataAccess/matchService";
import { saveMatchEventsInBatch } from "../dataAccess/matchEventService";
import { saveMatchNaturesInBatch } from "../dataAccess/matchNatureService";
import Match from "../domainCore/Match";
import Standing from "../domainCore/Standing";
import { saveStanding, findStandingByLeagueIdAndClubIdAndWeek } from "../dataAccess/standingService";
import { updateStandingsAfterMatch, UpdatedStandings } from "../domainEngine/leagues/standingsManager";

export const resolveMatches = async (season: number, week: number) => {
    // Get the upcoming Matches for resolving
    const matches = await findMatchesBySeasonAndWeek(season, week);

    // 2. palastellaan batcheiksi täällä? Huom. concurrency?

    for (const match of matches) {
        // mark the Match as started
        match.started = true;

        // get MatchNatures and MatchEvents from the resolver
        const { phases, events } = resolveMatch(match);

        // attach MatchEvents to the just-finished Match and persist them
        match.events = events;
        match.events.forEach((event) => { event.match = match; });
        await saveMatchEventsInBatch(match.events);

        // attach MatchNatures to the just-finished Match and persist them
        match.phases = phases;
        match.phases.forEach((phase) => { phase.match = match; });
        await saveMatchNaturesInBatch(match.phases);
        
        // mark the Match as finished (Halutaanko jossain vaiheessa keinotekoinen viive? Jos, ei kannattane tässä vaan jokin UI-kikkailu)
        match.finished = true;
        
        // persist the Match
        await saveMatch(match);

        // update the Standings of the contestants and persist them
        const { homeStanding, awayStanding }: UpdatedStandings = await updateStandingsAfterMatch(match);
        await saveStanding(homeStanding);
        await saveStanding(awayStanding);

        console.log(`Resolvoitiin matsi ${match.id}`);
    }

    
    // Ei paluudataa, heittää Erroreita jos tarpeen?
}