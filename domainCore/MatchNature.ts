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

        if (startMinute < 45 && (startMinute + MATCH_GRANULARITY_MINUTES) > 45) {
            this.endMinute = 45;
        } else if (startMinute >= 45 && (startMinute + MATCH_GRANULARITY_MINUTES) > 90) {
            this.endMinute = 90;
        } else {
            this.endMinute = startMinute + MATCH_GRANULARITY_MINUTES;
        }
        
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
        if ((this.endMinute - INTENSITY_TIME_STEP) < (this.startMinute + INTENSITY_TIME_STEP)) {
            return;
        } else {
            this.endMinute -= INTENSITY_TIME_STEP;
        }
    }

    // Match intensity slows down
    intensityDown = () => {
        if ((this.endMinute + INTENSITY_TIME_STEP) > (this.startMinute + 2 * INTENSITY_TIME_STEP)) {
            return;
        } else if (this.startMinute < 45 && (this.endMinute + INTENSITY_TIME_STEP) > 45) {
            this.endMinute = 45;
        } else if (this.startMinute < 90 && (this.endMinute + INTENSITY_TIME_STEP) > 90) {
            this.endMinute = 90;
        } else {
            this.endMinute += INTENSITY_TIME_STEP;
        }
    }

    
    pushAndCedePossession = (pushArea: PitchArea, cedeAreas: PitchArea[]) => {

    }

    

}

// hahmotelma:
// - push/cede: kumpikin joukkue voi lisätä vaikutusta tietyllä alueella ja luovuttaa vastaavan möäärän muilla alueilla
// - emphasize/de-emphasize: pelin painopiste lisääntyy tietyllä alueella ja vähenee toisella
// - luuppi kutsuu näitä n kertaa, viimeisen filtterin jälkeen uusi balance

// työnjako domainObjectin sisäinen logiikka vs. filtterit?
// keskikentän hallinta 