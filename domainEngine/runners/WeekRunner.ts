import { WeeklyEvent } from "../../domainModel/time/WeeklyEvent";
import Time from "../../domainModel/time/Time";

export default class WeekRunner {
    private static weeklyTimetable: WeeklyEvent[];
    private static eventsLeftThisWeek: WeeklyEvent[];

    static initialize() {
        WeekRunner.weeklyTimetable = [];
        WeekRunner.eventsLeftThisWeek = [];

        WeekRunner.weeklyTimetable.push(
            new WeeklyEvent(
                'youthAcademyDrawDeadline',
                {day: 1, hour: 21},
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
                {day: 6, hour: 20},
                () => {}
            )
        );

        WeekRunner.weeklyTimetable.push(
            new WeeklyEvent(
                'match',
                {day: 6, hour: 21},
                () => {}
            )
        );

        WeekRunner.weeklyTimetable.push(
            new WeeklyEvent(
                'financesUpdate',
                {day: 7, hour: 9},
                () => {}
            )
        );
    }

    static runWeek(time: Time) {
        if (time.day === 1 && time.hour === 0) {
            WeekRunner.eventsLeftThisWeek = WeekRunner.weeklyTimetable;
        } else {
            WeekRunner.eventsLeftThisWeek = WeekRunner.weeklyTimetable.filter(
                e => e.deadline.day > time.day || (e.deadline.day === time.day && e.deadline.hour >= time.hour)
            );

            const expiringEvent = WeekRunner.eventsLeftThisWeek.find(
                e => e.deadline.day === time.day && e.deadline.hour === time.hour
            );

            if (expiringEvent) {
                expiringEvent.finishingCallback();
                WeekRunner.eventsLeftThisWeek = WeekRunner.eventsLeftThisWeek.filter(
                    e => e != expiringEvent
                );
            }
        }
    }

    static getEvents(): WeeklyEvent[] {
        return WeekRunner.eventsLeftThisWeek;
    }
}