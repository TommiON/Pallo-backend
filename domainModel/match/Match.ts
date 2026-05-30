import Club from "../club/Club";
import League from "../league/League";
import MatchEvent from "./MatchEvent";
import { getRandomNumberInRange } from "../../utils/randomizer";

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

    play() {
        // await DomainEngine.MatchResolver.resolveMatch(this);
    }

    // dummies just an end result for now
    dummyPlay() {
        const numberOfHomeGoals = getRandomNumberInRange(0, 3);
        const numberOfAwayGoals = getRandomNumberInRange(0, 3);

        for (let i = 0; i < numberOfHomeGoals; i++) {
            this.events.push(new MatchEvent('goal', 'home', getRandomNumberInRange(1, 90)));
        }

        for (let i = 0; i < numberOfAwayGoals; i++) {
            this.events.push(new MatchEvent('goal', 'away', getRandomNumberInRange(1, 90)));
        }
    }

    getResult(): MatchResult {
        return {
            homeGoals: this.events.filter(e => e.type === 'goal' && e.initiator === 'home').length,
            awayGoals: this.events.filter(e => e.type === 'goal' && e.initiator === 'away').length
        }
    }
}

export type MatchResult = {
        homeGoals: number;
        awayGoals: number;
}
