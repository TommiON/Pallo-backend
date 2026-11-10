import { WeeklyEvent } from "../domainCore/WeeklyEvent";
import { WEEKLY_YOUTH_ACADEMY_DRAW_DEADLINE, WEEKLY_FINANCES_SETUP_DEADLINE, WEEKLY_TRAINING_SETUP_DEADLINE, WEEKLY_TRANSFERS_DEADLINE,
     WEEKLY_TRAINING, WEEKLY_MATCH_SETUP_DEADLINE, WEEKLY_MATCH, WEEKLY_FINANCES_UPDATE } from "../domainCore/domainProperties";
import { resolveMatches } from "../controllers/resolveMatches";

export const initializeWeeklyEvents = (): WeeklyEvent[] => {
    const events: WeeklyEvent[] = [];

    events.push(new WeeklyEvent(
                    'youthAcademyDrawDeadline',
                    WEEKLY_YOUTH_ACADEMY_DRAW_DEADLINE,
                    () => {}
    ));

    events.push(new WeeklyEvent(
                    'financesSetupDeadline',
                    WEEKLY_FINANCES_SETUP_DEADLINE,
                    () => {}
    ));

    events.push(new WeeklyEvent(
                    'trainingSetupDeadline',
                    WEEKLY_TRAINING_SETUP_DEADLINE,
                    () => {}
    )); 

    events.push(new WeeklyEvent(
                    'transfersDeadline',
                    WEEKLY_TRANSFERS_DEADLINE,
                    () => {}
    ));
    
    events.push(new WeeklyEvent(
                    'training',
                    WEEKLY_TRAINING,
                    () => {}
    ));
    
    events.push(new WeeklyEvent(
                    'matchSetupDeadline',
                    WEEKLY_MATCH_SETUP_DEADLINE,
                    () => {}
    ));
    
    events.push(new WeeklyEvent(
                    'match',
                    WEEKLY_MATCH,
                    resolveMatches
    ));
    
    events.push(new WeeklyEvent(
                    'financesUpdate',
                    WEEKLY_FINANCES_UPDATE,
                    () => {}
    ));

    return events;
}