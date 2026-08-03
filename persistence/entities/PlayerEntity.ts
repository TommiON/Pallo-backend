import { EntitySchema } from "typeorm"
import { sharedEntityBaseColumns } from "./sharedEntityBase";

// Pure data structure for persistence - no domain logic
export interface PlayerEntityData {
    id?: number;
    name: string;
    age: number;
    footedness: string;
    stamina: number;
    pace: number;
    strength: number;
    height: number;
    positioning: number;
    vision: number;
    shooting: number;
    heading: number;
    passing: number;
    tackling: number;
    ballControl: number;
    dribbling: number;
    shotStopping: number;
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
        stamina: {
            type: "int"
        },
        pace: {
            type: "int"
        },
        strength: {
            type: "int"
        },
        height: {
            type: "int"
        },
        positioning: {
            type: "int"
        },
        vision: {
            type: "int"
        },
        shooting: {
            type: "int"
        },
        heading: {
            type: "int"
        },
        passing: {
            type: "int"
        },
        tackling: {
            type: "int"
        },
        ballControl: {
            type: "int"
        },
        dribbling: {
            type: "int"
        },
        shotStopping: {
            type: "int"
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