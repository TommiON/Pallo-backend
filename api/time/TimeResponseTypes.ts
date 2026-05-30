import { TimeData } from "../../domainCore/time/TimeData";
import { WeeklyEventData } from "../../domainCore/time/WeeklyEventData";

export type TimeResponse = {
    currentTime: TimeData,
    upcomingEvents: WeeklyEventData[]
}