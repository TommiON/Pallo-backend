import Time from "../../domainCore/Time";
import type { TimeEntityData } from "../entities/TimeEntity";

export const fromTimeEntity = (entity: TimeEntityData): Time => {
    return new Time(entity.season, entity.week, entity.day, entity.hour);
};

export const toTimeEntityData = (time: Time): TimeEntityData => {
    return {
        // Time is a singleton, so id is always 1
        id: 1,
        season: time.season,
        week: time.week,
        day: time.day,
        hour: time.hour
    };
};
