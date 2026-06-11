export const resolveMatches = (season: number, week: number) => {
    // 1. haetaan matchit tietyltä kierrokselta (tälle service dataAccessiin)
    // 2. palastellaan batcheiksi täällä?
    // 3. lähetetään DomainEnginen MatchResolveriin
    // 4. saadaan vastaukseksi resolvoituja Matcheja, jotka tallennetaan

    // Tukeeko tietomalli sitä että matsi voidaan pelata täysin "eristetysti", ei tarvitse tietää mitään esim. liigoista ja muusta ulkopuolisesta?
    // Ei paluudataa, heittää Erroreita jos tarpeen?

    console.log('Lähdetään pelaamaan matseja, viikko', week)


}