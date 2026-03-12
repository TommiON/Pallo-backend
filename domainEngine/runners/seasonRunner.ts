import Time from "../../domainModel/time/Time";

export default class SeasonRunner {

    static initialize() {}

    static runSeason(time: Time) {
        if (time.week === 1 && time.day === 1 && time.hour === 0) {
            // kutsutaan leagueOrganizatoria
        }
    }
}