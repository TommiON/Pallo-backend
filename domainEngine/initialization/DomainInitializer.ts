import { WeeklyEvent } from "../../domainCore/WeeklyEvent";

export type DomainState = {
    weeklyEvents: WeeklyEvent[];
}

export const initializeDomain = (): DomainState => {
    return {
        weeklyEvents: generateWeeklyEvents()
    };
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
                    () => {}
                ));
    
    events.push(new WeeklyEvent(
                    'financesUpdate',
                    {day: 6, hour: 9},
                    () => {}
                ));

    return events;
}



 



       

      
