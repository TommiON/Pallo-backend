import { resolveMatch } from "../domainEngine/matches/MatchResolver";
import { findMatchesBySeasonAndWeek, saveMatch, saveMatchesInBatch } from "../dataAccess/matchService";
import { saveMatchEventsInBatch } from "../dataAccess/matchEventService";

export const resolveMatches = async (season: number, week: number) => {
    // Haetaan viikon ottelut ratkaistaviksi
    const matches = await findMatchesBySeasonAndWeek(season, week);

    // 2. palastellaan batcheiksi täällä?

    // 3. lähetetään DomainEnginen MatchResolveriin, joka palauttaa MatchEvent[]?
    // 4. assosioidaan MatchEventit Matcheihin
    // 4. saadaan vastaukseksi resolvoituja Matcheja, jotka tallennetaan
    //      tallennus pitää hoitaa transaktionaalisesti varmaankin

    matches.forEach((match) => {
        match.started = true;

        match.events = resolveMatch();
        match.events.forEach((event) => { event.match = match; });
        
        saveMatchEventsInBatch(match.events);
        
        match.finished = true;
        
        saveMatch(match);

        const tulos = match.getResult();
        console.log(`Ottelu ${match.id}, lopputulos: ${tulos.homeGoals} - ${tulos.awayGoals}`);
    })

    
    // Ei paluudataa, heittää Erroreita jos tarpeen?



}