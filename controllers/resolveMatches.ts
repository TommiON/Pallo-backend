import { resolveMatch } from "../domainEngine/matches/MatchResolver";
import { findMatchesBySeasonAndWeek, saveMatchesInBatch } from "../dataAccess/matchService";

export const resolveMatches = async (season: number, week: number) => {
    // 1. haetaan matchit tietyltä kierrokselta (tälle service dataAccessiin). Tukeeko tietomalli sitä että matsi voidaan pelata täysin eristetysti,
    //      ei tarvitse tietää mitään esim. liigoista ja muusta ulkopuolisesta?
    const matches = await findMatchesBySeasonAndWeek(season, week);

    console.log('PELIPÄIVÄ! Kausi ', season, 'viikko', week)

    matches.forEach((match) => {
        console.log(match)
    })

    // 2. palastellaan batcheiksi täällä?
    // 3. lähetetään DomainEnginen MatchResolveriin, joka palauttaa MatchEvent[]?
    // 4. assosioidaan MatchEventit Matcheihin
    // 4. saadaan vastaukseksi resolvoituja Matcheja, jotka tallennetaan
    //      tallennus pitää hoitaa transaktionaalisesti varmaankin
    // Ei paluudataa, heittää Erroreita jos tarpeen?



}