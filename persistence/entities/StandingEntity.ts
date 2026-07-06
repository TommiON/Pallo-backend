import { EntitySchema } from "typeorm";
import { sharedEntityBaseColumns } from "./sharedEntityBase";

export interface StandingEntityData {
    id?: number;
    leagueId: number;
    clubId: number;
    week: number;

    points: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;

    league?: any;
    club?: any;
}

export const StandingEntity = new EntitySchema<StandingEntityData>({
    name: "standing",    uniques: [
        {
            name: "UQ_standing_league_club_week",
            columns: ["leagueId", "clubId", "week"]
        }
    ],
    columns: {
        ...sharedEntityBaseColumns,
        leagueId: {
            name: "league_id",
            type: "int"
        },
        clubId: {
            name: "club_id",
            type: "int"
        },
        week: {
            type: "int"
        },
        points: {
            type: "int"
        },
        wins: {
            type: "int"
        },
        draws: {
            type: "int"
        },
        losses: {
            type: "int"
        },
        goalsFor: {
            name: "goals_for",
            type: "int"
        },
        goalsAgainst: {
            name: "goals_against",
            type: "int"
        }
    }, relations: {
        league: {
            target: "league",
            type: "many-to-one",
            joinColumn: { name: "league_id" },
            inverseSide: "standings"
        },
        club: {
            target: "club",
            type: "many-to-one",
            joinColumn: { name: "club_id" }
        }
    }
});