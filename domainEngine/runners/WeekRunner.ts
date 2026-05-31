import { WeeklyEvent } from "../../domainCore/WeeklyEvent";
import Time from "../../domainCore/Time";

export default class WeekRunner {
    private static weeklyTimetable: WeeklyEvent[];
    private static eventsLeftThisWeek: WeeklyEvent[];

    static initialize() {
        WeekRunner.weeklyTimetable = [];
        WeekRunner.eventsLeftThisWeek = [];

        WeekRunner.weeklyTimetable.push(
            new WeeklyEvent(
                'youthAcademyDrawDeadline',
                {day: 0, hour: 21},
                () => {}
            )
        );

        WeekRunner.weeklyTimetable.push(
            new WeeklyEvent(
                'financesSetupDeadline',
                {day: 1, hour: 21},
                () => {}
            )
        );

        WeekRunner.weeklyTimetable.push(
            new WeeklyEvent(
                'trainingSetupDeadline',
                {day: 2, hour: 21},
                () => {}
            )
        );

        WeekRunner.weeklyTimetable.push(
            new WeeklyEvent(
                'transfersDeadline',
                {day: 3, hour: 21},
                () => {}
            )
        );

        WeekRunner.weeklyTimetable.push(
            new WeeklyEvent(
                'training',
                {day: 4, hour: 9},
                () => {}
            )
        );

        WeekRunner.weeklyTimetable.push(
            new WeeklyEvent(
                'matchSetupDeadline',
                {day: 5, hour: 20},
                () => {}
            )
        );

        WeekRunner.weeklyTimetable.push(
            new WeeklyEvent(
                'match',
                {day: 5, hour: 21},
                () => {}
            )
        );

        WeekRunner.weeklyTimetable.push(
            new WeeklyEvent(
                'financesUpdate',
                {day: 6, hour: 9},
                () => {}
            )
        );
    }

    static runWeek(time: Time) {
        if (time.day === 0 && time.hour === 0) {
            WeekRunner.eventsLeftThisWeek = WeekRunner.weeklyTimetable;
        } else {
            WeekRunner.eventsLeftThisWeek = WeekRunner.weeklyTimetable.filter(e => !e.hasExpired(time));

            const expiringEvent = WeekRunner.eventsLeftThisWeek.find(e => e.isExpiring(time));

            if (expiringEvent) {
                expiringEvent.finish();
                WeekRunner.eventsLeftThisWeek = WeekRunner.eventsLeftThisWeek.filter(e => e != expiringEvent);
            }
        }
    }

    static getEvents(): WeeklyEvent[] {
        return WeekRunner.eventsLeftThisWeek;
    }
}