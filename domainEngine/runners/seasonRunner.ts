import Time from "../../domainModel/time/Time";
import { LEAGUE_NUMBER_OF_TEAMS } from "../../domainProperties/domainProperties";
import { findAttachedUserClubs, findNonAttachedUserClubs, findZombieClubs } from "../../services/clubService";
import { createLeaguesForSeason } from "../leagues/leagueFactory";
import { startScheduler } from "../main";

export default class SeasonRunner {
    static currentTime: Time;
    static schedulerCanStart: boolean = false;
    static schedulerHasStarted: boolean = false;

    static async runSeason(time: Time) {
        this.currentTime = time;

        if (this.currentTime.season === 1 && this.currentTime.week === 1 && this.currentTime.day === 1 && this.currentTime.hour === 0) {
            if (await this.isEnoughClubsForStartup()) {
                await createLeaguesForSeason(1);
                this.schedulerCanStart = true;
            }
        } else if (this.currentTime.week === 1 && this.currentTime.day === 1 && this.currentTime.hour === 0) {
            //await wrapUpLeaguesForSeason(this.currentTime.season - 1);
            // jos halutaan että LEAGUE_NUMBER_OF_TEAMS voi muuttua kausittain, tämä on oleellinen jakolinja (ei toteuteta vielä)
            await createLeaguesForSeason(time.season);
        } else if (await this.isEnoughClubsForStartup()) {
            this.schedulerCanStart = true;
        }

        if (this.schedulerCanStart && !this.schedulerHasStarted) {
            await startScheduler();
        }
    }

    // tarkistus on nyt yksisuuntainen: oletetaan että kun klubeja on kerran ollut riittävästi, niitä ei enää katoa
    static async updateClubSituation(): Promise<void> {
        if (this.schedulerCanStart) return;

        if (await this.isEnoughClubsForStartup()) {
            this.schedulerCanStart = true;
        }

        if (this.schedulerCanStart && !this.schedulerHasStarted) {
            await createLeaguesForSeason(1);
            await startScheduler();
        }
    }

    static async isEnoughClubsForStartup(): Promise<boolean> {
        const clubsOnWaitingList = await findNonAttachedUserClubs(this.currentTime.season);
        return clubsOnWaitingList.length >= LEAGUE_NUMBER_OF_TEAMS;
    }
}