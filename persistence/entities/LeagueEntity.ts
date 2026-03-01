import { EntitySchema } from "typeorm";

import League from "../../domainModel/league/League";
import { sharedEntityBaseColumns } from "./sharedEntityBase";

export const LeagueEntity = new EntitySchema<League>({
    name: "league",
    columns: {
        ...sharedEntityBaseColumns,
        season: { 
            type: "int" 
        },
        divisionLevel: { 
            type: "int" 
        },
        name: {
            type: "varchar"
        },
        started: {
            type: "boolean"
        },
        finished: {
            type: "boolean"
        },
        promotesToId: {
            name: "promotes_to_id",
            type: "int",
            nullable: true
        }
    },
    relations: {
        promotesTo: {
            target: "league",
            type: "many-to-one",
            joinColumn: { name: "promotes_to_id" }
        }
    }
})