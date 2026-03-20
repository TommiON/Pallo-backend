// TODO: this is very preliminary, just to enable dummy-playing matches

type MatchEventType = 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution';

export default class MatchEvent {
    id?: number;
    type: MatchEventType;
    initiator: 'home' | 'away';
    minute: number;
    // playerId?: number; // myöhemmin liitos pelaajiin, pitää miettiä tarvitaanko hyökkääjä vs. puolustaja -asetelma
    // followedBy: MatchEvent[]; // esim. syöttö -> maalitilanne -> maali ja loukkaantuminen

    constructor(type: MatchEventType, initiator: 'home' | 'away', minute: number) {
        this.type = type;
        this.initiator = initiator;
        this.minute = minute;
    }
}