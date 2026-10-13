import Match from "./Match";
import Player from "./Player";

/* 
MATCHEVENT: Individual action in a Match. Sequence of MatchEvents define how a Match concretely unfolds (with MatchNatures providing more structural information
that can not be captured by individial events). The most important of the various kinds of MatchEvents are, obviously, goals.

MatchEvents are grouped into families and subtypes, defined by the MatchEventTypeMap. 

Additional properties are the initiating side of the event (home or away),
references to offensive and defensive players involved, and minute. Furthermore, a MatchEvent may result in a subsequent MatchEvent, which is linked through the
followedBy property.
*/

// FilterOrigin: pitäisikö olla lisäkenttä johon filtteri voi tallentaa tietoa? Auttaisi informatiivisen otteluraportin rakentamisessa.

export type MatchEventTypeMap = {
    // Goal-scoring opportunity executed: may result in a goal, be off target, be made vain by the defense, or be saved by the goalkeeper.
    shot: 'goal' | 'off_target' | 'blocked' | 'saved';
    // Goal-scoring opportunity
    goal_opportunity: 'header' | 'long_range_shot' | '1_on_1' | 'scramble' | 'penalty';
    // 
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

export interface MatchEventData<TFamily extends MatchEventFamily = MatchEventFamily> {
    id?: number;
    match: Match;

    family: TFamily;
    subtype: MatchEventSubType<TFamily>;
    
    minute: number;
    initiator: MatchEventInitiator | null;
    // pitäisikö olla hyökkäävä ja puolustava osapuoli erikseen?
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