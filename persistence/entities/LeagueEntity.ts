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
        serialNumberOnDivisionLevel: {
            type: "int"
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
        },
        clubs: {
            target: "club",
            type: "many-to-many",
            joinTable: {
                name: "league_clubs",
                joinColumn: { name: "league_id" },
                inverseJoinColumn: { name: "club_id" }
            }
        }
    }
})