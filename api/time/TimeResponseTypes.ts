import { TimeData } from "../../domainCore/Time";
import { WeeklyEventData } from "../../domainCore/WeeklyEvent";

export type TimeResponse = {
    currentTime: TimeData,
    upcomingEvents: WeeklyEventData[]
}