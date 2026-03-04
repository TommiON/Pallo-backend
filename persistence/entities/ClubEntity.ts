import { EntitySchema } from "typeorm"

import Club from "../../domainModel/club/Club";
import { sharedEntityBaseColumns } from "./sharedEntityBase";

export const ClubEntity = new EntitySchema<Club>({
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