import Time from "../domainModel/time/Time";
import { advanceTime, initializeTime } from "../services/timeService"
import { TIME_SPEEDUP_FACTOR, TIME_USE_SCHEDULER } from "../domainProperties/domainProperties";

export const initializeDomain = async () => {
    // initialize time and related things
    const timeEntity = await initializeTime();
    const time = Time.fromEntity(timeEntity);

    time.registerChangeListener((newTime) => { console.log('Aika rientää:', newTime) });
}

export const startDomain = () => {
    // start scheduler
    if (TIME_USE_SCHEDULER) {
        const hourInMilliseconds = 60 * 60 * 1000;
        const interval = hourInMilliseconds / TIME_SPEEDUP_FACTOR;

        setInterval(async () => {
            await advanceTime();
        }, interval);
    }
}