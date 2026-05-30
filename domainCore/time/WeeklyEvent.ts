import Time from "./Time";

export type WeeklyDeadline = {
    day: number;
    hour: number;
}

export type WeeklyEventType = 
    'transfersDeadline' | 'matchSetupDeadline' | 'match' | 'trainingSetupDeadline' |
    'training' | 'financesSetupDeadline' | 'financesUpdate' | 'youthAcademyDrawDeadline';

export class WeeklyEvent {
    type: WeeklyEventType;
    deadline: WeeklyDeadline;
    finishingCallback: () => void;
    interactionFunction?: () => void;
    
    constructor(type: WeeklyEventType, deadline: WeeklyDeadline, callback: () => void, interaction?: () => void) {
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

    finish(): void {
        this.finishingCallback();
    }
}