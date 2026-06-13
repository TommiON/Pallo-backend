// TODO: this is very preliminary, just to enable dummy-playing matches

export type MatchEventType = 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution';
export type MatchEventInitiator = 'home' | 'away';

export interface MatchEventData {
    id?: number;
    matchId?: number;
    type: MatchEventType;
    initiator?: MatchEventInitiator;
    minute: number;
}

export default class MatchEvent implements MatchEventData {
    id?: number;
    matchId?: number;
    type: MatchEventType;
    initiator?: MatchEventInitiator;
    minute: number;
    // playerId?: number; // myöhemmin liitos pelaajiin, pitää miettiä tarvitaanko hyökkääjä vs. puolustaja -asetelma
    // followedBy: MatchEvent[]; // esim. syöttö -> maalitilanne -> maali ja loukkaantuminen

    constructor(type: MatchEventType, minute: number, initiator?: MatchEventInitiator) {
        this.type = type;
        this.initiator = initiator;
        this.minute = minute;
    }

}