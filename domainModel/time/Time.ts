import { LEAGUE_NUMBER_OF_TEAMS } from "../../domainProperties/domainProperties";
import type { TimeEntityData } from "../../persistence/entities/TimeEntity";

const weeksInSeason = (LEAGUE_NUMBER_OF_TEAMS - 1) * 2;

export default class Time {
    // Time is a singleton, only ever one Time exists in the database
    id: number = 1;

    season: number;
    week: number;
    day: number;
    hour: number

    constructor(season: number = 0, week: number = 0, day: number = 0, hour: number = 0, id: number = 1) {
        this.id = id;
        this.season = season;
        this.week = week;
        this.day = day;
        this.hour = hour;
    }

    // Factory: Database entity → Domain object
    static fromEntity(entity: TimeEntityData): Time {
        return new Time(entity.season, entity.week, entity.day, entity.hour, entity.id);
    }

    // Adapter: Domain object → Database entity
    toEntity(): TimeEntityData {
        return {
            id: this.id,
            season: this.season,
            week: this.week,
            day: this.day,
            hour: this.hour
        };
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
}