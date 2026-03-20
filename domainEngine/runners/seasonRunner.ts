import Time from "../../domainModel/time/Time";
import { findNonAttachedClubs, findZombieClubs } from "../../services/clubService";

export default class SeasonRunner {

    // itse asiassa initin pitää ottaa huomioon tietokannasta herääminen, jos liigat jo käynnissä
    static async initialize() {
        const newUserClubIds = await findNonAttachedClubs();
        if (newUserClubIds.length > 0) {
            console.log('Olis ekan liigan paikka:', newUserClubIds)
            
            // oikeasti kutsutaan leagueOrganizatoria
        }
    }

    static runSeason(time: Time) {
        if (time.week === 1 && time.day === 1 && time.hour === 0) {
            // kutsutaan leagueOrganizatoria
        }
    }
}