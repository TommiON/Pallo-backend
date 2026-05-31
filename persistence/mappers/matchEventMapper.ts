import MatchEvent, { MatchEventType, MatchEventInitiator } from "../../domainCore/match/MatchEvent";
import type { MatchEventEntityData } from "../entities/MatchEventEntity";

export const fromMatchEventEntity = (entity: MatchEventEntityData): MatchEvent => {
    const event = new MatchEvent(
        entity.type as MatchEventType,
        entity.initiator as MatchEventInitiator,
        entity.minute
    );
    event.id = entity.id;
    event.matchId = entity.matchId;
    return event;
};

export const toMatchEventEntityData = (event: MatchEvent): MatchEventEntityData => {
    return {
        id: event.id,
        matchId: event.matchId,
        type: event.type,
        initiator: event.initiator,
        minute: event.minute
    };
};
