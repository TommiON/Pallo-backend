// TODO: this is very preliminary, just to enable dummy-playing matches

export type MatchEventType = 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution';
export type MatchEventInitiator = 'home' | 'away';

export default class MatchEvent {
    id?: number;
    matchId?: number;
    type: MatchEventType;
    initiator: MatchEventInitiator;
    minute: number;
    // playerId?: number; // myöhemmin liitos pelaajiin, pitää miettiä tarvitaanko hyökkääjä vs. puolustaja -asetelma
    // followedBy: MatchEvent[]; // esim. syöttö -> maalitilanne -> maali ja loukkaantuminen

    constructor(type: MatchEventType, initiator: MatchEventInitiator, minute: number) {
        this.type = type;
        this.initiator = initiator;
        this.minute = minute;
    }

}