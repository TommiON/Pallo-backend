import Club from "../club/Club";
import { getRandomNumberInRange } from "../../utils/randomizer";

export default class League {
    id?: number;
    season: number;
    started: boolean;
    finished: boolean;
    divisionLevel: number;
    name?: string;
    promotesToId?: number;
    promotesTo: League | null;

    clubs?: Club[];
    // matches?: Match[];
    // standings?: Standing[];

    constructror(season: number, divisionLevel: number, promotesTo: League | null) {
        this.season = season

        this.divisionLevel = divisionLevel;
        this.promotesTo = promotesTo;

        this.started = false;
        this.finished = false;

        this.name = generateDivisionName(divisionLevel);
    }
}

const generateDivisionName = (divisionLevel: number): string => {
    // jokin vähän sofistikoituneempi nimeämisjärjestelmä kun ehditään
    return `${divisionLevel}. divisioona ${getRandomNumberInRange(1, 1000000)}`;
}



