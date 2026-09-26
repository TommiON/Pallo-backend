import Club from "./Club";
import League from "./League";
import MatchEvent from "./MatchEvent";
import MatchNature from "./MatchNature";

// Tiivistelmätietotyyppi
export type MatchResult = {
        id?: number;
        homeClub: Club;
        awayClub: Club;
        homeGoals: number;
        awayGoals: number;
}

// Core data contract for League - defines what's exposed externally
export interface MatchData {
    id?: number;
    league?: League;
    homeClub: Club;
    awayClub: Club;
    week: number;
    started: boolean;
    finished: boolean;
    events: MatchEvent[];
    phases: MatchNature[];
}

export default class Match {
    id?: number;
    league?: League;
    homeClub: Club;
    awayClub: Club;
    week: number;
    started: boolean;
    finished: boolean;
    events: MatchEvent[];
    phases: MatchNature[];

    constructor(homeClub: Club, awayClub: Club, week: number, league?: League) {
        this.homeClub = homeClub;
        this.awayClub = awayClub;
        this.league = league;
        this.week = week;
        this.started = false;
        this.finished = false;
        this.events = [];
        this.phases = [];
    }

    getResult(): MatchResult {
        return {
            id: this.id,
            homeClub: this.homeClub,
            awayClub: this.awayClub,
            homeGoals: this.events.filter(e => e.type === 'goal' && e.initiator === 'home').length,
            awayGoals: this.events.filter(e => e.type === 'goal' && e.initiator === 'away').length
        }
    }
}
