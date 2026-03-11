type WeeklyDeadline = {
    day: number;
    hour: number;
}

type WeeklyEventType = 
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

    hasExpired(day: number, hour: number): boolean {
        return (day > this.deadline.day) || (day === this.deadline.day && hour >= this.deadline.hour);
    }

    isAboutToExpire(day: number, hour: number): boolean {
        return (day === this.deadline.day && hour >= this.deadline.hour - 8);
    }

    finish() {
        this.finishingCallback();
    }

    interact() {
        if (this.interactionFunction) {
            this.interactionFunction();
        }
    }
}