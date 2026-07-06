import { resolveMatch } from "../domainEngine/matches/MatchResolver";
import { findMatchesBySeasonAndWeek, saveMatch, saveMatchesInBatch } from "../dataAccess/matchService";
import { saveMatchEventsInBatch } from "../dataAccess/matchEventService";
import Match from "../domainCore/Match";
import Standing from "../domainCore/Standing";
import { saveStanding, findStandingByLeagueIdAndClubId } from "../dataAccess/standingService";

export const resolveMatches = async (season: number, week: number) => {
    // Haetaan viikon ottelut ratkaistaviksi
    const matches = await findMatchesBySeasonAndWeek(season, week);

    const updateStandings = async (match: Match) => {
        const result = match.getResult();
        
        const newHomeStanding = new Standing();
        newHomeStanding.league = match.league!;
        newHomeStanding.club = match.homeClub;
        newHomeStanding.week = match.week;

        const previousHomeStanding = await findStandingByLeagueIdAndClubId(match.league!.id!, match.homeClub.id!);
        console.log(`previousHomeStanding: ${previousHomeStanding}`);

        const newAwayStanding = new Standing();
        newAwayStanding.league = match.league!;
        newAwayStanding.club = match.awayClub;
        newAwayStanding.week = match.week;
    };

    // 2. palastellaan batcheiksi täällä?

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

        await updateStandings(match);

        const tulos = match.getResult();
        console.log(`Ottelu ${match.id}, lopputulos: ${tulos.homeGoals} - ${tulos.awayGoals}`);
    }

    
    // Ei paluudataa, heittää Erroreita jos tarpeen?



}