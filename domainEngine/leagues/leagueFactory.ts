import { LEAGUE_NUMBER_OF_TEAMS } from "../../domainProperties/domainProperties"

/** This module is responsible for creating leagues for a given season. */

type LeaguePyramidSize = {
    depth: number;
    totalNumberOfLeagues: number;
}

export const createLeaguesForSeason = async (season: number) => {
    console.log('Luotaisiin liigat kaudelle ' + season);

    // työn aikana edellinen ja tuleva liigapyramidi in-memory, jonkinlainen tietorakenne?
    // haetaan edellisen kauden liigat (<- leagueService.findLeaguesBySeason)
    // kopioidaan se tulevan pohjaksi
    // swap, promotion/relegation
    // generate fixtures
    // kirjoitetaan uudet kantaan (-> leagueService)
    // kirjoitetaan vanhat kantaan, deaktivinti (-> leagueService)


}

// Luodaan sen verran liigoja kuin saadaan täyteen, ylijäävät joutuvat odottamaan seuraavaa kautta.
// Muutetaan sitten kun saadaan zombiet toteutettua.
const calculateNumberOfLeagues = (numberOfClubs: number): number => {
    return Math.floor(numberOfClubs / LEAGUE_NUMBER_OF_TEAMS);
}