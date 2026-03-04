import Club from "../club/Club";
import { getRandomNumberInRange } from "../../utils/randomizer";

export default class League {
    id?: number;
    
    season: number;
    divisionLevel: number;
    serialNumberOnDivisionLevel: number;

    promotesToId?: number;
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