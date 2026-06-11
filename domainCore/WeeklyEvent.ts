import Time from "./Time";

//Core data contract for WeeklyEvent - defines what's exposed externally
export interface WeeklyEventData {
    type: WeeklyEventType;
    deadline: WeeklyDeadline;
}

export type WeeklyDeadline = {
    day: number;
    hour: number;
}

export type WeeklyEventType = 
    'transfersDeadline' | 'matchSetupDeadline' | 'match' | 'trainingSetupDeadline' |
    'training' | 'financesSetupDeadline' | 'financesUpdate' | 'youthAcademyDrawDeadline';

export type WeeklyEventCallbackFunctions = {
    transfersDeadline: () => void;
    matchSetupDeadline: () => void;
    match: (season: number, week: number) => void | Promise<void>;
    trainingSetupDeadline: () => void;
    training: () => void;
    financesSetupDeadline: () => void;
    financesUpdate: () => void;
    youthAcademyDrawDeadline: () => void;
}

export type WeeklyEventCallback = WeeklyEventCallbackFunctions[WeeklyEventType];

export class WeeklyEvent {
    type: WeeklyEventType;
    deadline: WeeklyDeadline;
    finishingCallback: WeeklyEventCallback;
    interactionFunction?: WeeklyEventCallback;
    
    constructor(type: WeeklyEventType, deadline: WeeklyDeadline, callback: WeeklyEventCallback, interaction?: WeeklyEventCallback) {
        this.type = type;
        this.deadline = deadline;
        this.finishingCallback = callback;
        this.interactionFunction = interaction;
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