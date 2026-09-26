import { EntitySchema } from "typeorm";
import { sharedEntityBaseColumns } from "./sharedEntityBase";

export interface MatchNatureEntityData {
    id?: number;
    matchId: number;
    startMinute: number;
    endMinute: number;
    balance: string; // JSON stringified Map<PitchArea, number>
    homePossession: string; // JSON stringified Map<PitchArea, number>
}

export const MatchNatureEntity = new EntitySchema<MatchNatureEntityData>({
    name: "MatchNature",
    columns: {
        ...sharedEntityBaseColumns,
        matchId: {
            type: Number,
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
});