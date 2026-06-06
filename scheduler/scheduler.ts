import { WeeklyEvent } from "../domainCore/WeeklyEvent";
import { initializeDomain } from "../domainEngine/initialization/DomainInitializer";
import { initializeTime, getCurrentTime } from "../dataAccess/timeService";
// TODO: nämä eivät ole DomainPropertyja, laita enviin ja mietin envin sijainti
import { TIME_SPEEDUP_FACTOR, TIME_USE_SCHEDULER } from "../domainCore/domainProperties";

let weeklySchedule: WeeklyEvent[];

export const initializeScheduler = async () => {
    const domainState = initializeDomain();

    weeklySchedule = domainState.weeklyEvents;

    await initializeTime();
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

    if (currentTime.isTheVeryBeginningOfTime()) {

    } else if (currentTime.isTheStartOfASeason()) {

    }
    
}