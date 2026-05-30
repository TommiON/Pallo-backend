import Time from "../../domainCore/time/Time";
import type { TimeEntityData } from "../entities/TimeEntity";

export const fromTimeEntity = (entity: TimeEntityData): Time => {
    return new Time(entity.season, entity.week, entity.day, entity.hour, entity.id);
};

export const toTimeEntityData = (time: Time): TimeEntityData => {
    return {
        id: time.id,
        season: time.season,
        week: time.week,
        day: time.day,
        hour: time.hour
    };
};
