import Club from "../club/Club";
import MatchEvent from "./MatchEvent";
import { getRandomNumberInRange } from "../../utils/randomizer";

export default class Match {
    id?: number;
    homeClub: Club;
    awayClub: Club;
    week: number;
    started: boolean;
    finished: boolean;
    events: MatchEvent[];

    constructor(homeClub: Club, awayClub: Club, week: number) {
        this.homeClub = homeClub;
        this.awayClub = awayClub;
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
