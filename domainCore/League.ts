import Club from "./Club";
import { getRandomNumberInRange } from "./domainUtils";

// Core data contract for League - defines what's exposed externally
export interface LeagueData {
    id?: number;
    season: number;
    divisionLevel: number;
    serialNumberOnDivisionLevel: number;
    started: boolean;
    finished: boolean;
}

export default class League implements LeagueData {
    id?: number;
    season: number;
    divisionLevel: number;
    serialNumberOnDivisionLevel: number;
    promotesTo: League | null;
    started: boolean;
    finished: boolean;

    clubs?: Club[];
    // matches?: Match[];
    // standings?: Standing[];

    constructor(season: number, divisionLevel: number, serialNumberOnDivisionLevel: number, promotesTo: League | null) {
        this.season = season;
        this.divisionLevel = divisionLevel;
        this.promotesTo = promotesTo;
        this.serialNumberOnDivisionLevel = serialNumberOnDivisionLevel;

        this.started = false;
        this.finished = false;
    }

}