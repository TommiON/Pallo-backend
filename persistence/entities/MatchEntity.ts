import { EntitySchema } from "typeorm";
import { sharedEntityBaseColumns } from "./sharedEntityBase";

export interface MatchEntityData {
    id?: number;
    leagueId: number;
    homeClubId: number;
    awayClubId: number;
    week: number;
    started: boolean;
    finished: boolean;
    league?: any;
    homeClub?: any;
    awayClub?: any;
}

export const MatchEntity = new EntitySchema<MatchEntityData>({
    name: "match",
    columns: {
        ...sharedEntityBaseColumns,
        leagueId: {
            name: "league_id",
            type: "int"
        },
        homeClubId: {
            name: "home_club_id",
            type: "int"
        },
        awayClubId: {
            name: "away_club_id",
            type: "int"
        },
        week: {
            type: "int"
        },
        started: {
            type: "boolean"
        },
        finished: {
            type: "boolean"
        }
    },
    relations: {
        league: {
            target: "league",
            type: "many-to-one",
            joinColumn: { name: "league_id" },
            inverseSide: "matches"
        },
        homeClub: {
            target: "club",
            type: "many-to-one",
            joinColumn: { name: "home_club_id" }
        },
        awayClub: {
            target: "club",
            type: "many-to-one",
            joinColumn: { name: "away_club_id" }
        }
    }
})