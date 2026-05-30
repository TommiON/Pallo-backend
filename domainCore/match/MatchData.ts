import { MatchEventData } from "./MatchEventData";

export interface MatchResult {
    id?: number;
    homeGoals?: number;
    awayGoals?: number;
}

export interface FullMatchData {
    id?: number;
    leagueId?: number;
    homeClubId: number;
    awayClubId: number;
    week: number;
    started: boolean;
    finished: boolean;
    events: MatchEventData[];
}