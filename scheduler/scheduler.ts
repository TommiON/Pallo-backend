import { WeeklyEvent } from "../domainCore/WeeklyEvent";
import Time from "../domainCore/Time";
import { initializeDomain } from "../domainEngine/initialization/DomainInitializer";
import { initializeTime, getCurrentTime, updateTime } from "../dataAccess/timeService";
import { startNewSeason, NotEnoughClubsForSeasonStartError } from "../controllers/startNewSeason";
// TODO: nämä eivät ole DomainPropertyja, laita enviin ja mietin envin sijainti
import { TIME_SPEEDUP_FACTOR, TIME_USE_SCHEDULER } from "../domainCore/domainProperties";

let weeklySchedule: WeeklyEvent[];
let currentWeekEvents: WeeklyEvent[] = [];

export const initializeScheduler = async () => {
    const domainState = initializeDomain();

    weeklySchedule = domainState.weeklyEvents;
    currentWeekEvents = [];

    await initializeTime();

    const currentTime = await getCurrentTime();
    if (!currentTime) {
        throw new Error("Time not initialized");
    }

    currentWeekEvents = getWeekEventsForCurrentTime(currentTime);
}

export const startScheduler = () => {
    if (TIME_USE_SCHEDULER) {
        const hourInMilliseconds = 60 * 60 * 1000;
        const interval = hourInMilliseconds / TIME_SPEEDUP_FACTOR;
    
        setInterval(async () => await tick(), interval);
    }
}

const tick = async () => {
    const currentTime = await getCurrentTime();

    if (!currentTime) return;

    // Toistaiseksi oletus: kun klubeja on kerran riittävästi ensimmäisen liigan luomiseen, niitä ei enää katoa.
    // Myöhemmin kehitettävä niin että klubeja voi myös passivoitua.
    // Myös: ClubCreated-messaging pois käytöstä -> kun klubeja tarpeeksi, vaatii sovelluksen uudelleenkäynnistyksen
    if (currentTime.isTheStartOfASeason()) {
        try {
            await startNewSeason(currentTime.season);
        } catch (error: unknown) {
            if (error instanceof NotEnoughClubsForSeasonStartError) {
                console.log('Kausi ei voi alkaa, ei tarpeeksi joukkueita.');
                return;
            } else {
                throw error;
            }
        }
    }

    if (currentTime.isTheStartOfAWeek()) {
        currentWeekEvents = getWeekEventsForCurrentTime(currentTime);
    }

    currentWeekEvents = currentWeekEvents.filter((e) => !e.hasExpired(currentTime));

    const expiringRightNow: WeeklyEvent | undefined = currentWeekEvents.find((e) => e.isExpiring(currentTime));

    if (expiringRightNow) {
        expiringRightNow.finish();
        currentWeekEvents = currentWeekEvents.filter((e) => e !== expiringRightNow);
    }

    currentTime.advanceByAnHour();
    await updateTime(currentTime);
}

const getWeekEventsForCurrentTime = (currentTime: Time): WeeklyEvent[] => {
    return weeklySchedule.filter((event) => !event.hasExpired(currentTime));
}

export type AppClock = {
    season: number;
    week: number;
    day: number;
    hour: number;
    weeklyEvents: WeeklyEvent[];
}

export const getCurrentTimeWithEvents = async (): Promise<AppClock> => {
    const currentTime = await getCurrentTime();

    if (!currentTime) {
        throw new Error("Time not initialized");
    }

    return {
        season: currentTime.season,
        week: currentTime.week,
        day: currentTime.day,
        hour: currentTime.hour,
        weeklyEvents: currentWeekEvents
    }
}