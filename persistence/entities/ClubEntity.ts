import { EntitySchema } from "typeorm"
import { sharedEntityBaseColumns } from "./sharedEntityBase";

// Pure data structure for persistence - no domain logic
export interface ClubEntityData {
    id?: number;
    name: string;
    passwordHash?: string;
    established: Date;
    zombie: boolean;
    players?: any;
    leagues?: any;
}

export const ClubEntity = new EntitySchema<ClubEntityData>({
    name: "club",
    columns: {
        ...sharedEntityBaseColumns,
        name: { 
            type: "varchar",
            unique: true
        },
        passwordHash: { 
            type: "varchar",
            nullable: true
        },
        established: {
            name: "established",
            type: "timestamp with time zone"
        },
        zombie: {
            type: "boolean"
        }
    },
    relations: {
        players: {
            target: "player",
            type: "one-to-many",
            inverseSide: "club"
        },
        leagues: {
            target: "league",
            type: "many-to-many",
            inverseSide: "clubs"
        }
    }
})