import Club from "./Club";
import League from "./League";

/* STANDING: a Club's situation in a League at a given moment (week and season; the latter implicit via League's season). */

export interface StandingData {
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

export default class Standing implements StandingData {
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