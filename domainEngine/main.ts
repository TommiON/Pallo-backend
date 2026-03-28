import { advanceTime, initializeTime, onTimeChanged } from "../services/timeService"
import SeasonRunner from "./runners/SeasonRunner";
import WeekRunner from "./runners/WeekRunner";
import { TIME_SPEEDUP_FACTOR, TIME_USE_SCHEDULER } from "../domainProperties/domainProperties";

export const initializeDomain = async () => {
    onTimeChanged((t) => SeasonRunner.runSeason(t));

    WeekRunner.initialize();
    onTimeChanged((t) => WeekRunner.runWeek(t));
    
    await initializeTime();
}

// started by SeasonRunner, if conditions met
export const startScheduler = async () => {
    if (TIME_USE_SCHEDULER) {
        console.log('KOVAA AJOA!')

        const hourInMilliseconds = 60 * 60 * 1000;
        const interval = hourInMilliseconds / TIME_SPEEDUP_FACTOR;

        setInterval(async () => {
            await advanceTime();
        }, interval);

        SeasonRunner.schedulerHasStarted = true;
    }
}