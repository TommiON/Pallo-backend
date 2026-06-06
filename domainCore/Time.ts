import { LEAGUE_NUMBER_OF_TEAMS } from "./domainProperties";

const weeksInSeason = (LEAGUE_NUMBER_OF_TEAMS - 1) * 2;

// Core data contract for Time - defines what's exposed externally
export interface TimeData {
    season: number;
    week: number;
    day: number;
    hour: number
}

export default class Time {
    season: number;
    week: number;
    day: number;
    hour: number;

    constructor(season: number = 0, week: number = 0, day: number = 0, hour: number = 0) {
        this.season = season;
        this.week = week;
        this.day = day;
        this.hour = hour;
    }

    advanceByAnHour() {
        if (this.hour == 23) {
            this.hour = 0;
            this.day += 1;
        } else {
            this.hour += 1;
        }

        if (this.day > 6) {
            this.day = 0;
            this.week += 1;
        }

        if (this.week > weeksInSeason - 1) {
            this.week = 0;
            this.season += 1;
        }

        return this;
    }

    isTheVeryBeginningOfTime(): boolean {
        return this.season === 0 && this.week === 0 && this.day === 0 && this.hour === 0;
    }

    isTheStartOfASeason(): boolean {
        return this.week === 0 && this.day === 0 && this.hour === 0;
    }

    isTheStartOfAWeek(): boolean {
        return this.day === 0 && this.hour === 0;
    }
}