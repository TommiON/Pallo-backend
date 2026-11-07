import { EntitySchema } from "typeorm";
import { sharedEntityBaseColumns } from "./sharedEntityBase";

export interface TacticsEntityData {
    id?: number;
    matchId?: number;
    side?: string;
    formation: string;
    masterTactic: string;
    locked?: boolean;
    lineupSlots?: any;
}

export const TacticsEntity = new EntitySchema<TacticsEntityData>({
    name: "tactics",
    columns: {
        ...sharedEntityBaseColumns,
        matchId: {
            name: "match_id",
            type: "int"
        },
        side: {
            type: "varchar"
        },
        formation: {
            name: "formation",
            type: "varchar"
        },
        masterTactic: {
            name: "master_tactic",
            type: "varchar"
        },
        locked: {
            type: "boolean",
            default: false
        }
    },
    relations: {
        lineupSlots: {
            target: "tactics_lineup_slot",
            type: "one-to-many",
            inverseSide: "tactics",
            cascade: true
        }
    },
    indices: [
        {
            name: "IDX_tactics_match_side_unique",
            columns: ["matchId", "side"],
            unique: true
        }
    ]
});