import { TimeData } from "../../domainModel/time/TimeData";
import { WeeklyEventData } from "../../domainModel/time/WeeklyEventData";

export type TimeResponse = {
    currentTime: TimeData,
    upcomingEvents: WeeklyEventData[]
}