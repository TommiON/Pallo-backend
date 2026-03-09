import Time from "../domainModel/time/Time";
import { advanceTime, initializeTime } from "../services/timeService"
import { seasonRunner } from "./runners/seasonRunner";
import { TIME_SPEEDUP_FACTOR, TIME_USE_SCHEDULER } from "../domainProperties/domainProperties";

export const initializeDomain = async () => {
    // register time listeners for Runners, then initialize Time
    let time = new Time();

    time.registerChangeListener((t: Time) => seasonRunner(t));
    
    time = await initializeTime();
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