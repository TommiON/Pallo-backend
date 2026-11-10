import Time from "./Time";

/*
WEEKLY EVENT: recurring event in game's weekly cycle. Differs from most other Domain Objects for being just conceptual, i.e. not persisted as an instance.
*/

export type WeeklyEventType = 
    'transfersDeadline' |
    'matchSetupDeadline' | 
    'match' | 
    'trainingSetupDeadline' |
    'training' | 
    'financesSetupDeadline' |
    'financesUpdate' | 
    'youthAcademyDrawDeadline';

export type WeeklyDeadline = {
    day: number;
    hour: number;
}

export type WeeklyEventCallbackFunctions = {
    transfersDeadline: () => void;
    matchSetupDeadline: () => void;                                     // locks (disables) further Tactics updates
    match: (season: number, week: number) => void | Promise<void>;      // sends Matches for resolution
    trainingSetupDeadline: () => void;
    training: () => void;
    financesSetupDeadline: () => void;
    financesUpdate: () => void;
    youthAcademyDrawDeadline: () => void;
}

export type WeeklyEventCallback = WeeklyEventCallbackFunctions[WeeklyEventType];

export interface WeeklyEventData {
    type: WeeklyEventType;
    deadline: WeeklyDeadline;
}

export class WeeklyEvent implements WeeklyEventData {
    type: WeeklyEventType;
    deadline: WeeklyDeadline;
    finishingCallback: WeeklyEventCallback;
    
    constructor(type: WeeklyEventType, deadline: WeeklyDeadline, callback: WeeklyEventCallback) {
        this.type = type;
        this.deadline = deadline;
        this.finishingCallback = callback;
    }

    hasExpired(time: Time): boolean {
        return this.deadline.day < time.day || (this.deadline.day === time.day && this.deadline.hour < time.hour);
    }

    isExpiring(time: Time): boolean {
        return this.deadline.day === time.day && this.deadline.hour === time.hour;
    }

    finish(season?: number, week?: number): void | Promise<void> {
        return (this.finishingCallback as any)(season, week);
    }
}