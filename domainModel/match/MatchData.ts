import { MatchEventData } from "./MatchEventData";

export interface MatchResult {
    id?: number;
    homeGoals?: number;
    awayGoals?: number;
}

export interface FullMatchData {
    id?: number;
    homeClubId: number;
    awayClubId: number;
    started: boolean;
    finished: boolean;
    events: MatchEventData[];
}