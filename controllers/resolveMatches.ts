import { resolveMatch } from "../domainEngine/matches/MatchResolver";
import { findMatchesBySeasonAndWeek, saveMatch, saveMatchesInBatch } from "../dataAccess/matchService";
import { saveMatchEventsInBatch } from "../dataAccess/matchEventService";
import Match from "../domainCore/Match";
import Standing from "../domainCore/Standing";
import { saveStanding, findStandingByLeagueIdAndClubIdAndWeek } from "../dataAccess/standingService";
import { updateStandingsAfterMatch, UpdatedStandings } from "../domainEngine/leagues/standingsManager";

export const resolveMatches = async (season: number, week: number) => {
    // Haetaan viikon ottelut ratkaistaviksi
    const matches = await findMatchesBySeasonAndWeek(season, week);

    // 2. palastellaan batcheiksi täällä? Huom. concurrency?

    // 3. lähetetään DomainEnginen MatchResolveriin, joka palauttaa MatchEvent[]?
    // 4. assosioidaan MatchEventit Matcheihin
    // 4. saadaan vastaukseksi resolvoituja Matcheja, jotka tallennetaan
    //      tallennus pitää hoitaa transaktionaalisesti varmaankin

    for (const match of matches) {
        match.started = true;

        match.events = resolveMatch();
        match.events.forEach((event) => { event.match = match; });
        await saveMatchEventsInBatch(match.events);
        
        match.finished = true;
        
        await saveMatch(match);

        const { homeStanding, awayStanding }: UpdatedStandings = await updateStandingsAfterMatch(match);

        await saveStanding(homeStanding);
        await saveStanding(awayStanding);

        console.log(`Resolvoitiin matsi ${match.id}`);
    }

    
    // Ei paluudataa, heittää Erroreita jos tarpeen?
}