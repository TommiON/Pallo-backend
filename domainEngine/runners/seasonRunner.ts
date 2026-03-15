import Time from "../../domainModel/time/Time";
import { findNonAttachedClubs, findZombieClubs } from "../../services/clubService";

export default class SeasonRunner {

    // itse asiassa initin pitää ottaa huomioon tietokannasta herääminen, jos liigat jo käynnissä
    static async initialize() {
        // TODO: clubServiceen mahdollisuus hakea vain osa Clubista (id:t), muuta ei esim. tässä tarvita
        // pitää miettiä arkkitehtuuri, ClubData-contract näkyy API:lle, pitäisikö DomainEnginen
        // suuntaan olla jokin riisuttu contract myös?

        const newUserClubs = await findNonAttachedClubs();
        if (newUserClubs.length > 0) {
            console.log('Olis ekan liigan paikka:', newUserClubs)
            // oikeasti kutsutaan leagueOrganizatoria
        }
    }

    static runSeason(time: Time) {
        if (time.week === 1 && time.day === 1 && time.hour === 0) {
            // kutsutaan leagueOrganizatoria
        }
    }
}