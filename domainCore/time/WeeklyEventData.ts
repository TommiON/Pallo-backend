import { WeeklyEventType, WeeklyDeadline } from "./WeeklyEvent";

/**
 * Core data contract for WeeklyEvent - defines what's exposed externally
 */
export interface WeeklyEventData {
    type: WeeklyEventType;
    deadline: WeeklyDeadline;
}