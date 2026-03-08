import { EntitySchema } from "typeorm"
import { sharedEntityBaseColumns } from "./sharedEntityBase";

// Pure data structure for persistence - no domain logic
export interface PlayerEntityData {
    id?: number;
    name: string;
    age: number;
    footedness: string;
    clubId?: number;
    club?: any;
}

export const PlayerEntity = new EntitySchema<PlayerEntityData>({
    name: "player",
    columns: {
        ...sharedEntityBaseColumns,
        name: { 
            type: "varchar" 
        },
        age: { 
            type: "int" 
        },
        footedness: {
            type: "varchar"
        },
        clubId: {
            name: "club_id",
            type: "int",
            nullable: true
        }
    },
    relations: {
        club: {
            target: "club",
            type: "many-to-one",
            joinColumn: { name: "club_id" }
        }
    }
})