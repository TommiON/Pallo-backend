import Club from "./Club";
import League from "./League";

export default class Standing {
    id?: number;

    league: League;
    club: Club;
    week: number;

    points: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
}