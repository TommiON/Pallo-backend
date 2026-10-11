import Match from "./Match";
import Player from "./Player";

/* MATCHEVENT: individual action in a Match.

*/

export type MatchEventTypeMap = {
    goal_attempt: 'goal' | 'shot_on_target' | 'shot_off_target' | 'shot_blocked';
    goal_set_up: 'cross' | 'through_pass' | 'cutback' | 'set_piece_delivery';
    foul: 'foul' | 'yellow_card' | 'red_card';
    injury: 'injury';
    substitution: 'substitution';
};

export type MatchEventFamily = keyof MatchEventTypeMap;

export type MatchEventSubType<T extends MatchEventFamily = MatchEventFamily> =
    T extends MatchEventFamily
        ? MatchEventTypeMap[T]
        : never;

export type MatchEventType = MatchEventSubType;

export type MatchEventInitiator = 'home' | 'away';

// maalitilanne: keskitys, kaukolaukas, läpisyöttö, läpiajo, rangaistuspotku, kulmapotku, vapaapotku, 
// pitäisikö jotenkin hyödyntää xG-ajattelua: pallo maalipaikkaan -> yritys -> maali, ohi, blokki, torjunta
// - voisi eriyttää hyökkäyksen paskuuden ja puolustuksen hyvyyden jos maali jää tulematta
// - oleellista tässä kohtaa saada hyvä ja future-proof MatchEvent-malli, filttereitä ehtii säätää myöhemmin

export interface MatchEventData<TFamily extends MatchEventFamily = MatchEventFamily> {
    id?: number;
    match: Match;

    family: TFamily;
    subtype: MatchEventSubType<TFamily>;
    
    minute: number;
    initiator: MatchEventInitiator | null;
    player: Player;
    followedBy: MatchEvent | null;
}

export default class MatchEvent<TFamily extends MatchEventFamily = MatchEventFamily> implements MatchEventData<TFamily> {
    id?: number;
    match: Match;
    family: TFamily;

    subtype: MatchEventSubType<TFamily>;
    
    initiator: MatchEventInitiator | null;
    minute: number;
    player: Player;
    followedBy: MatchEvent | null;

    constructor(family: TFamily, subtype: MatchEventSubType<TFamily>, minute: number, initiator?: MatchEventInitiator, player?: Player, match?: Match) {
        this.family = family;
        this.subtype = subtype;
        this.initiator = initiator ?? null;
        this.minute = minute;
        this.player = player!;
        this.match = match!;
        this.followedBy = null;
    }
}