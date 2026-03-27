import Time from "../../domainModel/time/Time";
import { LEAGUE_NUMBER_OF_TEAMS } from "../../domainProperties/domainProperties";
import { findAttachedUserClubs, findNonAttachedUserClubs, findZombieClubs } from "../../services/clubService";
import { createLeaguesForSeason } from "../leagues/leagueFactory";
import { wrapUpLeaguesForSeason } from "../leagues/leagueDeactivator";
import { startScheduler } from "../main";

export default class SeasonRunner {
    static schedulerCanStart: boolean = false;
    static schedulerHasStarted: boolean = false;

    static async runSeason(time: Time) {
        console.log('Ping...', time);
        if (time.season === 1 && time.week === 1 && time.day === 1 && time.hour === 0) {
            const clubsOnWaitingList = await findNonAttachedUserClubs(1);
            if (clubsOnWaitingList.length >= LEAGUE_NUMBER_OF_TEAMS) {
                await createLeaguesForSeason(1);
                this.schedulerCanStart = true;
            }
        } else if (time.week === 1 && time.day === 1 && time.hour === 0) {
            await wrapUpLeaguesForSeason(time.season - 1);
            // jos halutaan että LEAGUE_NUMBER_OF_TEAMS voi muuttua kausittain, tämä on oleellinen jakolinja (ei toteuteta vielä)
            await createLeaguesForSeason(time.season);
            this.schedulerCanStart = true;
        }

        if (this.schedulerCanStart && !this.schedulerHasStarted) {
            await startScheduler();
        }
    }

    
}