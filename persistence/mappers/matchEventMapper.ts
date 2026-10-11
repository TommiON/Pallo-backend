import MatchEvent, { MatchEventFamily, MatchEventType, MatchEventInitiator } from "../../domainCore/MatchEvent";
import Match from "../../domainCore/Match";
import type { MatchEventEntityData } from "../entities/MatchEventEntity";

export const fromMatchEventEntity = (entity: MatchEventEntityData): MatchEvent => {
    const event = new MatchEvent(
        entity.family as MatchEventFamily,
        entity.subtype as MatchEventType,
        entity.minute,
        entity.initiator as MatchEventInitiator
    );
    event.id = entity.id;
    if (entity.matchId !== undefined) {
        event.match = { id: entity.matchId } as Match;
    }
    return event;
};

export const toMatchEventEntityData = (event: MatchEvent): MatchEventEntityData => {
    return {
        id: event.id,
        matchId: event.match?.id,
        family: event.family,
        subtype: event.subtype,
        initiator: event.initiator ? event.initiator : "",
        minute: event.minute
    };
};
