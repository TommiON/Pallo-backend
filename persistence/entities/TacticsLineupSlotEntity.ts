import { EntitySchema } from "typeorm";
import { sharedEntityBaseColumns } from "./sharedEntityBase";

export interface TacticsLineupSlotEntityData {
    id?: number;
    tacticsId: number;
    slotIndex: number;
    position: string;
    playerId?: number | null;
    tactics?: any;
    player?: any;
}

export const TacticsLineupSlotEntity = new EntitySchema<TacticsLineupSlotEntityData>({
    name: "tactics_lineup_slot",
    columns: {
        ...sharedEntityBaseColumns,
        tacticsId: {
            name: "tactics_id",
            type: "int"
        },
        slotIndex: {
            name: "slot_index",
            type: "int"
        },
        position: {
            type: "varchar"
        },
        playerId: {
            name: "player_id",
            type: "int",
            nullable: true
        }
    },
    relations: {
        tactics: {
            target: "tactics",
            type: "many-to-one",
            joinColumn: { name: "tactics_id" },
            inverseSide: "lineupSlots",
            onDelete: "CASCADE"
        },
        player: {
            target: "player",
            type: "many-to-one",
            joinColumn: { name: "player_id" },
            nullable: true
        }
    },
    indices: [
        {
            name: "IDX_tactics_lineup_slot_tactics_slot",
            columns: ["tacticsId", "slotIndex"],
            unique: true
        },
        {
            name: "IDX_tactics_lineup_slot_tactics_player",
            columns: ["tacticsId", "playerId"],
            unique: true
        }
    ]
});