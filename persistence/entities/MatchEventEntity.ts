import { EntitySchema } from "typeorm";
import { sharedEntityBaseColumns } from "./sharedEntityBase";

// Pure data structure for persistence - no domain logic
export interface MatchEventEntityData {
    id?: number;
    matchId?: number;
    type: string;
    initiator: string;
    minute: number;
    match?: any;
}

export const MatchEventEntity = new EntitySchema<MatchEventEntityData>({
    name: "match_event",
    columns: {
        ...sharedEntityBaseColumns,
        matchId: {
            name: "match_id",
            type: "int"
        },
        type: {
            type: "varchar"
        },
        initiator: {
            type: "varchar"
        },
        minute: {
            type: "int"
        }
    },
    relations: {
        match: {
            target: "match",
            type: "many-to-one",
            joinColumn: { name: "match_id" },
            inverseSide: "events"
        }
    }
})
