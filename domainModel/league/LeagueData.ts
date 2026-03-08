/**
 * Core data contract for League - defines what's exposed externally
 * Domain objects and API responses are derived from this
 */
export interface LeagueData {
    id?: number;
    season: number;
    divisionLevel: number;
    serialNumberOnDivisionLevel: number;
    promotesToId?: number;
    started: boolean;
    finished: boolean;
}
