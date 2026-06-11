import { WeeklyEvent, WeeklyEventCallbackFunctions, WeeklyEventType } from "../../domainCore/WeeklyEvent";

export type { WeeklyEventCallbackFunctions };

export const initializeWeeklyEvents = (callbacks: WeeklyEventCallbackFunctions): WeeklyEvent[] => {
    const events: WeeklyEvent[] = generateWeeklyEvents();

    for (const weeklyEventType in callbacks) {
        const callback = callbacks[weeklyEventType as WeeklyEventType];
        const event = events.find(e => e.type === weeklyEventType);
        if (event) {
            event.finishingCallback = callback;
        }
    }

    return events;
}
    
const generateWeeklyEvents = (): WeeklyEvent[] => {
    const events: WeeklyEvent[] = [];

    events.push(new WeeklyEvent(
                    'youthAcademyDrawDeadline',
                    {day: 0, hour: 21},
                    () => {}
                ));

    events.push(new WeeklyEvent(
                    'financesSetupDeadline',
                    {day: 1, hour: 21},
                    () => {}
                ));

    events.push(new WeeklyEvent(
                    'trainingSetupDeadline',
                    {day: 2, hour: 21},
                    () => {}
                )); 

    events.push(new WeeklyEvent(
                    'transfersDeadline',
                    {day: 3, hour: 21},
                    () => {}
                ));
    
    events.push(new WeeklyEvent(
                    'training',
                    {day: 4, hour: 9},
                    () => {}
                ));
    
    events.push(new WeeklyEvent(
                    'matchSetupDeadline',
                    {day: 5, hour: 20},
                    () => {}
                ));
    
    events.push(new WeeklyEvent(
                    'match',
                    {day: 5, hour: 21},
                    async (season, week) => {}
                ));
    
    events.push(new WeeklyEvent(
                    'financesUpdate',
                    {day: 6, hour: 9},
                    () => {}
                ));

    return events;
}