import { EntitySchema } from "typeorm";
import { sharedEntityBaseColumns } from "./sharedEntityBase";

export interface MatchNatureEntityData {
    id?: number;
    matchId: number;
    match?: any;
    startMinute: number;
    endMinute: number;
    balance: string; // JSON stringified Map<PitchArea, number>
    homePossession: string; // JSON stringified Map<PitchArea, number>
}

export const MatchNatureEntity = new EntitySchema<MatchNatureEntityData>({
    name: "match_nature",
    columns: {
        ...sharedEntityBaseColumns,
        matchId: {
            name: "match_id",
            type: "int"
        },
        startMinute: {
            type: Number,
        },
        endMinute: {
            type: Number,
        },
        balance: {
            type: String,
        },
        homePossession: {
            type: String,
        },
    },
    relations: {
        match: {
            target: "match",
            type: "many-to-one",
            joinColumn: { name: "match_id" },
            inverseSide: "phases"
        }
    }
});