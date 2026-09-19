import Match from "./Match";
import { MATCH_GRANULARITY_MINUTES } from "./domainProperties";

export type PitchArea = 'homeDefenceLeft' |
                        'homeDefenceCentre' |
                        'homeDefenceRight' | 
                        'midfield' |
                        'homeAttackLeft' |
                        'homeAttackCentre' |
                        'homeAttackRight';

const INTENSITY_TIME_STEP = MATCH_GRANULARITY_MINUTES / 3;
const TIME_COMPARISON_EPSILON = 1e-9;

export default class MatchNature {
    match: Match;
    startMinute: number;
    endMinute: number;
    balance: Map<PitchArea, number>;
    homePossession: Map<PitchArea, number>;

    // default object that filters can then alter along the chain
    constructor(match: Match, startMinute: number) {
        this.match = match;
        this.startMinute = startMinute;

        this.endMinute = this.getMaxEndMinute();
        
        this.balance = new Map<PitchArea, number>();
        this.homePossession = new Map<PitchArea, number>();

        this.balance.set('homeDefenceLeft', 10);
        this.balance.set('homeDefenceCentre', 10);
        this.balance.set('homeDefenceRight', 10);
        this.balance.set('midfield', 40);
        this.balance.set('homeAttackLeft', 10);
        this.balance.set('homeAttackCentre', 10);
        this.balance.set('homeAttackRight', 10);

        this.homePossession.set('homeDefenceLeft', 50);
        this.homePossession.set('homeDefenceCentre', 50);
        this.homePossession.set('homeDefenceRight', 50);
        this.homePossession.set('midfield', 50);
        this.homePossession.set('homeAttackLeft', 50);
        this.homePossession.set('homeAttackCentre', 50);
        this.homePossession.set('homeAttackRight', 50);
    }

    // Match intensity increases
    intensityUp = () => {
        const minEndMinute = this.startMinute + INTENSITY_TIME_STEP;
        const nextEndMinute = this.endMinute - INTENSITY_TIME_STEP;

        if (nextEndMinute < (minEndMinute - TIME_COMPARISON_EPSILON)) {
            return;
        }

        this.endMinute = Math.abs(nextEndMinute - minEndMinute) <= TIME_COMPARISON_EPSILON
            ? minEndMinute
            : nextEndMinute;
    }

    // Match intensity slows down
    intensityDown = () => {
        const maxEndMinute = this.getMaxEndMinute();
        const nextEndMinute = this.endMinute + INTENSITY_TIME_STEP;

        if (nextEndMinute > (maxEndMinute + TIME_COMPARISON_EPSILON)) {
            return;
        }

        this.endMinute = Math.abs(nextEndMinute - maxEndMinute) <= TIME_COMPARISON_EPSILON
            ? maxEndMinute
            : nextEndMinute;
    }

    
    pushAndCedePossession = (pushArea: PitchArea, cedeAreas: PitchArea[]) => {

    }

    private getMaxEndMinute(): number {
        if (this.startMinute < 45 && (this.startMinute + MATCH_GRANULARITY_MINUTES) > 45) {
            return 45;
        }

        if (this.startMinute >= 45 && (this.startMinute + MATCH_GRANULARITY_MINUTES) > 90) {
            return 90;
        }

        return this.startMinute + MATCH_GRANULARITY_MINUTES;
    }
    

}

// hahmotelma:
// - push/cede: kumpikin joukkue voi lisätä vaikutusta tietyllä alueella ja luovuttaa vastaavan möäärän muilla alueilla
// - emphasize/de-emphasize: pelin painopiste lisääntyy tietyllä alueella ja vähenee toisella
// - luuppi kutsuu näitä n kertaa, viimeisen filtterin jälkeen uusi balance

// työnjako domainObjectin sisäinen logiikka vs. filtterit?
// keskikentän hallinta 