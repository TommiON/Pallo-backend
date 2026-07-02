import { resolveMatch } from "../domainEngine/matches/MatchResolver";

export const resolveMatches = (season: number, week: number) => {
    // 1. haetaan matchit tietyltä kierrokselta (tälle service dataAccessiin). Tukeeko tietomalli sitä että matsi voidaan pelata täysin eristetysti,
    //      ei tarvitse tietää mitään esim. liigoista ja muusta ulkopuolisesta?
    // 2. palastellaan batcheiksi täällä?
    // 3. lähetetään DomainEnginen MatchResolveriin
    // 4. saadaan vastaukseksi resolvoituja Matcheja, jotka tallennetaan
    //      tallennus pitää hoitaa transaktionaalisesti varmaankin
    // Ei paluudataa, heittää Erroreita jos tarpeen?

    console.log('Lähdetään pelaamaan matseja, viikko', week)


}