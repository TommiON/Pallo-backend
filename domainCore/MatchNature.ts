import Match from "./Match";
import { MATCH_GRANULARITY_MINUTES } from "./domainProperties";

/*
MatchNature holds and manages three properties describing Match as a whole:
- Intensity; How much or little is happening. Expressed through the endMinute property; the lower it is, the higher the intensity, causing the next resolver loop to launch earlier.
- Balance: How play is distributed across the seven PitchAreas. Totals to 100% for the entire pitch.
- Home possession: How big a share of the ball the home team has in each of the PitchAreas. Visiting team implicitly 1 - home possession.

Mutation principles:
- No direct access, modifications through dedicated methods only.
- Changes are constant and non-parametric, decided internally by MatchNature itself.
- Changes are capped to a limit.
- Balance and possession have a tendency towards 50%: changes upwards from 50% become progressively smaller, changes towards 50% from below are bigger when the initial value is far from 50%.
- The final, Match-affecting state is usually a result of multiple rounds of adjustment: a filter may change something one way, a subsequent filter the other way.
*/

export type PitchArea = 'homeDefenceLeft' |
                        'homeDefenceCentre' |
                        'homeDefenceRight' | 
                        'midfield' |
                        'homeAttackLeft' |
                        'homeAttackCentre' |
                        'homeAttackRight';

const INTENSITY_TIME_STEP = MATCH_GRANULARITY_MINUTES / 3;
const DEFENCE_DEFAULT_BALANCE = 0.1;
const ATTACK_DEFAULT_BALANCE = 0.1;
const MIDFIELD_DEFAULT_BALANCE = 0.4;
const POSSESSION_DEFAULT = 0.5;
const TIME_COMPARISON_EPSILON = 1e-9;

export default class MatchNature {
    readonly match: Match;
    readonly startMinute: number;
    private _endMinute: number;
    private readonly _balance: Map<PitchArea, number>;
    private readonly _homePossession: Map<PitchArea, number>;

    get endMinute(): number {
        return this._endMinute;
    }

    get balance(): ReadonlyMap<PitchArea, number> {
        return this._balance;
    }

    get homePossession(): ReadonlyMap<PitchArea, number> {
        return this._homePossession;
    }

    // default object that filters can then alter along the chain
    constructor(match: Match, startMinute: number) {
        this.match = match;
        this.startMinute = startMinute;

        this._endMinute = this.getMaxEndMinute();
        
        this._balance = new Map<PitchArea, number>();
        this._homePossession = new Map<PitchArea, number>();

        this._balance.set('homeDefenceLeft', DEFENCE_DEFAULT_BALANCE);
        this._balance.set('homeDefenceCentre', DEFENCE_DEFAULT_BALANCE);
        this._balance.set('homeDefenceRight', DEFENCE_DEFAULT_BALANCE);
        this._balance.set('midfield', MIDFIELD_DEFAULT_BALANCE);
        this._balance.set('homeAttackLeft', ATTACK_DEFAULT_BALANCE);
        this._balance.set('homeAttackCentre', ATTACK_DEFAULT_BALANCE);
        this._balance.set('homeAttackRight', ATTACK_DEFAULT_BALANCE);

        this._homePossession.set('homeDefenceLeft', POSSESSION_DEFAULT);
        this._homePossession.set('homeDefenceCentre', POSSESSION_DEFAULT);
        this._homePossession.set('homeDefenceRight', POSSESSION_DEFAULT);
        this._homePossession.set('midfield', POSSESSION_DEFAULT);
        this._homePossession.set('homeAttackLeft', POSSESSION_DEFAULT);
        this._homePossession.set('homeAttackCentre', POSSESSION_DEFAULT);
        this._homePossession.set('homeAttackRight', POSSESSION_DEFAULT);
    }

    // Increase intensity. 
    intensityUp = () => {
        const minEndMinute = this.startMinute + INTENSITY_TIME_STEP;
        const nextEndMinute = this._endMinute - INTENSITY_TIME_STEP;

        if (nextEndMinute < (minEndMinute - TIME_COMPARISON_EPSILON)) {
            return;
        }

        this._endMinute = Math.abs(nextEndMinute - minEndMinute) <= TIME_COMPARISON_EPSILON
            ? minEndMinute
            : nextEndMinute;
    }

    // Slow down intensity.
    intensityDown = () => {
        const maxEndMinute = this.getMaxEndMinute();
        const nextEndMinute = this._endMinute + INTENSITY_TIME_STEP;

        if (nextEndMinute > (maxEndMinute + TIME_COMPARISON_EPSILON)) {
            return;
        }

        this._endMinute = Math.abs(nextEndMinute - maxEndMinute) <= TIME_COMPARISON_EPSILON
            ? maxEndMinute
            : nextEndMinute;
    }

    // Adjust balance of play. Any increases in gainAreas are offset by decreases in loseAreas, because total is always 100%
    rebalance = (gainAreas: PitchArea[], loseAreas: PitchArea[]) => {
        
    }

    // Increases either home or away possession in the specified pitch area.
    pushForPossession = (pushArea: PitchArea, home: boolean) => {
        const homePossession = this._homePossession.get(pushArea);

        if (homePossession === undefined) {
            throw new Error(`Missing possession value for pitch area: ${pushArea}`);
        }

        const currentValue = home ? homePossession : 1 - homePossession;

        if (this.getPossessionProportionalDistanceFromDefault(currentValue) >= 0.3) {
            // lisätään vähän...
        } else if (this.getPossessionProportionalDistanceFromDefault(currentValue) >= 0.2) {

        } else if (this.getPossessionProportionalDistanceFromDefault(currentValue) >= 0.1) {

        } else {
            // lisätään paljon...
        }

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

    // itse asiassa tämän ei pitäne käyttää itseiarvoa, mieti uusiksi!
    private getPossessionProportionalDistanceFromDefault = (currentValue: number): number => {
        return Math.abs(currentValue - POSSESSION_DEFAULT) / POSSESSION_DEFAULT;
    }

    private getBalanceProportionalDistanceFromDefault = (currentValue: number, pitchArea: PitchArea): number => {
        if (pitchArea === 'midfield') {
            return Math.abs(currentValue - MIDFIELD_DEFAULT_BALANCE) / MIDFIELD_DEFAULT_BALANCE;
        } else if (pitchArea in ['homeAttackLeft', 'homeAttackRight', 'awayAttackLeft', 'awayAttackRight']) {
            return Math.abs(currentValue - ATTACK_DEFAULT_BALANCE) / ATTACK_DEFAULT_BALANCE;
        } else if (pitchArea in ['homeDefenceLeft', 'homeDefenceCentre', 'homeDefenceRight']) {
            return Math.abs(currentValue -  DEFENCE_DEFAULT_BALANCE) / DEFENCE_DEFAULT_BALANCE;
        } else {
            return currentValue;
        }
    }
}

// hahmotelma:
// - push/cede: kumpikin joukkue voi lisätä vaikutusta tietyllä alueella ja luovuttaa vastaavan möäärän muilla alueilla
// - emphasize/de-emphasize: pelin painopiste lisääntyy tietyllä alueella ja vähenee toisella
// - luuppi kutsuu näitä n kertaa, viimeisen filtterin jälkeen uusi balance

// työnjako domainObjectin sisäinen logiikka vs. filtterit?
// keskikentän hallinta 