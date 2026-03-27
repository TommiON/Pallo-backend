import { LEAGUE_NUMBER_OF_TEAMS } from "../../domainProperties/domainProperties"
/**
 * This module is responsible for creating leagues for a given season.
 */
export const createLeaguesForSeason = async (season: number) => {
    console.log('Luotaisiin liigat kaudelle ' + season);
}

// Luodaan sen verran liigoja kuin saadaan täyteen, ylijäävät joutuvat odottamaan seuraavaa kautta.
// Muutetaan sitten kun saadaan zombiet toteutettua.
const calculateNumberOfLeagues = (numberOfClubs: number): number => {
    return Math.floor(numberOfClubs / LEAGUE_NUMBER_OF_TEAMS);
}