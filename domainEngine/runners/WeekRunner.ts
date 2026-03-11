import { WeeklyEvent } from "../../domainModel/time/WeeklyEvent";
import Time from "../../domainModel/time/Time";

export default class WeekRunner {
    static weeklyTimetable: WeeklyEvent[];
    static eventsLeftThisWeek: WeeklyEvent[];

    static initialize() {
        WeekRunner.weeklyTimetable = [];
        WeekRunner.eventsLeftThisWeek = [];

        WeekRunner.weeklyTimetable.push(
            new WeeklyEvent(
                'trainingSetupDeadline',
                {day: 2, hour: 20},
                () => console.log('treenidedis meni!')
        ));

        WeekRunner.weeklyTimetable.push(
            new WeeklyEvent(
                'transfersDeadline',
                {day: 4, hour: 20},
                () => console.log('siirtodedis meni!')
        ));

        WeekRunner.weeklyTimetable.push(
            new WeeklyEvent(
                'matchSetupDeadline',
                {day: 6, hour: 19},
                () => console.log('matsidedis meni!')
        ));
    }

    // mieti tämä vielä paremmin, pitää osata myös palautuminen kannan ajasta
    static runWeek(time: Time) {
        if (time.day === 1 && time.hour === 0) {
            WeekRunner.eventsLeftThisWeek = WeekRunner.weeklyTimetable;
            console.log('Alkaa uusi viikko:', time.week, 'jonka ohjelma', WeekRunner.eventsLeftThisWeek);
        } else {
            const expiringEvent = WeekRunner.eventsLeftThisWeek.find(
                e => e.deadline.day === time.day && e.deadline.hour === time.hour
            );

            if (expiringEvent) {
                expiringEvent.finishingCallback();
                WeekRunner.eventsLeftThisWeek = WeekRunner.eventsLeftThisWeek.filter(
                    e => e != expiringEvent
                );

                console.log('Yksi meni, jäljellä vielä:', WeekRunner.eventsLeftThisWeek)
            }
        }
    }
}