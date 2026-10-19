import { EntitySchema } from "typeorm";
import { sharedEntityBaseColumns } from "./sharedEntityBase";

export interface TacticsEntityData {
    id?: number;
    formation: string;
    masterTactic: string;
    lineupSlots?: any;
}

export const TacticsEntity = new EntitySchema<TacticsEntityData>({
    name: "tactics",
    columns: {
        ...sharedEntityBaseColumns,
        formation: {
            name: "formation",
            type: "varchar"
        },
        masterTactic: {
            name: "master_tactic",
            type: "varchar"
        }
    },
    relations: {
        lineupSlots: {
            target: "tactics_lineup_slot",
            type: "one-to-many",
            inverseSide: "tactics",
            cascade: true
        }
    }
});