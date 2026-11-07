import Club from "./Club";
import League from "./League";
import MatchEvent from "./MatchEvent";
import MatchNature from "./MatchNature";
import Tactics, { MatchSide } from "./Tactics";

/* MATCH: a contest between two Clubs. */

export type MatchResult = {
        id?: number;
        homeClub: Club;
        awayClub: Club;
        homeGoals: number;
        awayGoals: number;
}

export interface MatchData {
    id?: number;
    
    league?: League;
    week: number;

    homeClub: Club;
    awayClub: Club;
    homeTactics: Tactics | null;
    awayTactics: Tactics | null;
    
    started: boolean;
    finished: boolean;
    
    events: MatchEvent[];
    phases: MatchNature[];
}

export default class Match implements MatchData {
    id?: number;
    
    league?: League;
    week: number;

    homeClub: Club;
    awayClub: Club;
    homeTactics: Tactics | null;
    awayTactics: Tactics | null;
    
    started: boolean;
    finished: boolean;
    
    events: MatchEvent[];
    phases: MatchNature[];

    constructor(homeClub: Club, awayClub: Club, week: number, league?: League) {
        this.homeClub = homeClub;
        this.awayClub = awayClub;
        this.league = league;
        this.week = week;
        this.homeTactics = null;
        this.awayTactics = null;
        this.started = false;
        this.finished = false;
        this.events = [];
        this.phases = [];
    }

    public setTactics(side: MatchSide, tactics: Tactics): void {
        if (this.started || this.finished) {
            throw new Error("Cannot change tactics after match has started.");
        }

        if (tactics.side !== side) {
            throw new Error(`Tactics side mismatch: expected ${side}, got ${tactics.side}.`);
        }

        if (side === "home") {
            this.homeTactics = tactics;
        } else {
            this.awayTactics = tactics;
        }
    }

    public lockTactics(): void {
        if (!this.homeTactics || !this.awayTactics) {
            throw new Error("Both home and away tactics must be assigned before the match can start.");
        }

        this.homeTactics.lock();
        this.awayTactics.lock();
    }

    public start(): void {
        if (!this.homeTactics || !this.awayTactics) {
            throw new Error("Both home and away tactics must be assigned before the match can start.");
        }

        this.started = true;
        this.lockTactics();
    }

    getResult(): MatchResult {
        return {
            id: this.id,
            homeClub: this.homeClub,
            awayClub: this.awayClub,
            homeGoals: this.events.filter(e => e.subtype === 'goal' && e.initiator === 'home').length,
            awayGoals: this.events.filter(e => e.subtype === 'goal' && e.initiator === 'away').length
        }
    }
}
