import { EntitySchema } from "typeorm"

import Player from "../../domainModel/player/Player";
import { sharedEntityBaseColumns } from "./sharedEntityBase";

export const PlayerEntity = new EntitySchema<Player>({
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