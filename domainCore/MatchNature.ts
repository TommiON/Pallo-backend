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
- Balance and possession grow with diminishing returns.
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
const DIMINISHING_RETURNS_FACTOR = 0.2;
const TIME_COMPARISON_EPSILON = 1e-9;

export interface MatchNatureData {
    id?: number;
    match: Match;
    startMinute: number;
    endMinute: number;
    balance: ReadonlyMap<PitchArea, number>;
    homePossession: ReadonlyMap<PitchArea, number>;
}

export default class MatchNature {
    id?: number;
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

    public static createInitial(match: Match, startMinute: number): MatchNature {
        return new MatchNature(match, startMinute);
    }

    public static createFromPrevious(previousMatchNature: MatchNature): MatchNature {
        const nextMatchNature = new MatchNature(
            previousMatchNature.match,
            previousMatchNature.endMinute,
        );

        nextMatchNature.copyMapValues(previousMatchNature._balance, nextMatchNature._balance);
        nextMatchNature.copyMapValues(previousMatchNature._homePossession, nextMatchNature._homePossession);

        return nextMatchNature;
    }

    public static restoreFromPersistence(data: MatchNatureData): MatchNature {
        const restoredMatchNature = new MatchNature(data.match, data.startMinute);

        restoredMatchNature.id = data.id;
        restoredMatchNature._endMinute = data.endMinute;
        restoredMatchNature.copyMapValues(data.balance, restoredMatchNature._balance);
        restoredMatchNature.copyMapValues(data.homePossession, restoredMatchNature._homePossession);

        return restoredMatchNature;
    }

    private constructor(match: Match, startMinute: number) {
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

    private getMaxEndMinute(): number {
        if (this.startMinute < 45 && (this.startMinute + MATCH_GRANULARITY_MINUTES) > 45) {
            return 45;
        }

        if (this.startMinute >= 45 && (this.startMinute + MATCH_GRANULARITY_MINUTES) > 90) {
            return 90;
        }

        return this.startMinute + MATCH_GRANULARITY_MINUTES;
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
        const newValue = this.growShareWithDiminishingReturns(currentValue);

        if (home) {
            this._homePossession.set(pushArea, newValue);
        } else {
            this._homePossession.set(pushArea, 1 - newValue);
        }
    }

    private growShareWithDiminishingReturns = (currentValue: number): number => {
        if (currentValue > 0.8) {
            return currentValue;
        }

        const diminishingFactor = 1 - currentValue;

        return currentValue + (diminishingFactor * DIMINISHING_RETURNS_FACTOR);
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

    private copyMapValues<T>(source: ReadonlyMap<PitchArea, T>, target: Map<PitchArea, T>): void {
        target.clear();

        for (const [key, value] of source.entries()) {
            target.set(key, value);
        }
    }
}