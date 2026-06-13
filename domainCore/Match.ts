import Club from "./Club";
import League from "./League";
import MatchEvent from "./MatchEvent";
import { getRandomNumberInRange } from "./domainUtils";

// Tiivistelmätietotyyppi
export type MatchResult = {
        id?: number;
        homeClub: Club;
        awayClub: Club;
        homeGoals: number;
        awayGoals: number;
}

export default class Match {
    id?: number;
    leagueId?: number;
    league?: League;
    homeClubId?: number;
    awayClubId?: number;
    homeClub: Club;
    awayClub: Club;
    week: number;
    started: boolean;
    finished: boolean;
    events: MatchEvent[];

    constructor(homeClub: Club, awayClub: Club, week: number, league?: League) {
        this.homeClub = homeClub;
        this.awayClub = awayClub;
        this.homeClubId = homeClub.id;
        this.awayClubId = awayClub.id;
        this.league = league;
        this.leagueId = league?.id;
        this.week = week;
        this.started = false;
        this.finished = false;
        this.events = [];
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
