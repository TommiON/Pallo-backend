// TODO: this is very preliminary, just to enable dummy-playing matches

import type { MatchEventEntityData } from "../../persistence/entities/MatchEventEntity";

type MatchEventType = 'goal' | 'assist' | 'yellow_card' | 'red_card' | 'substitution';

export default class MatchEvent {
    id?: number;
    matchId?: number;
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

    // Factory: Database entity → Domain object
    static fromEntity(entity: MatchEventEntityData): MatchEvent {
        const event = new MatchEvent(
            entity.type as MatchEventType,
            entity.initiator as 'home' | 'away',
            entity.minute
        );
        event.id = entity.id;
        event.matchId = entity.matchId;
        return event;
    }

    // Adapter: Domain object → Database entity
    toEntity(): MatchEventEntityData {
        return {
            id: this.id,
            matchId: this.matchId,
            type: this.type,
            initiator: this.initiator,
            minute: this.minute
        };
    }
}