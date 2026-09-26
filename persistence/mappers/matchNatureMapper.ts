import Match from "../../domainCore/Match";
import MatchNature, { PitchArea } from "../../domainCore/MatchNature";
import { MatchNatureEntityData } from "../entities/MatchNatureEntity";

const serializePitchAreaMap = (map: ReadonlyMap<PitchArea, number>): string => (
    JSON.stringify(Array.from(map.entries()))
);

const deserializePitchAreaMap = (value: string): Map<PitchArea, number> => (
    new Map(JSON.parse(value) as [PitchArea, number][])
);

export const fromMatchNatureEntity = (entity: MatchNatureEntityData): MatchNature => {
    const match = (entity.match ?? { id: entity.matchId }) as Match;

    return MatchNature.restoreFromPersistence({
        id: entity.id,
        match,
        startMinute: entity.startMinute,
        endMinute: entity.endMinute,
        balance: deserializePitchAreaMap(entity.balance),
        homePossession: deserializePitchAreaMap(entity.homePossession),
    });
};

export const toMatchNatureEntityData = (matchNature: MatchNature): MatchNatureEntityData => {
    const matchId = matchNature.match?.id;

    if (matchId === undefined) {
        throw new Error("MatchNature.match.id is required for persistence");
    }

    return {
        id: matchNature.id,
        matchId,
        startMinute: matchNature.startMinute,
        endMinute: matchNature.endMinute,
        balance: serializePitchAreaMap(matchNature.balance),
        homePossession: serializePitchAreaMap(matchNature.homePossession),
    };
};