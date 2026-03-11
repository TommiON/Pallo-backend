import Time from "../domainModel/time/Time";
import { advanceTime, initializeTime } from "../services/timeService"
import SeasonRunner from "./runners/SeasonRunner";
import WeekRunner from "./runners/WeekRunner";
import { TIME_SPEEDUP_FACTOR, TIME_USE_SCHEDULER } from "../domainProperties/domainProperties";

export const initializeAndStartDomain = async () => {
    // register time listeners for Runners, then initialize Time
    let time = new Time();

    SeasonRunner.initialize();
    WeekRunner.initialize();

    time.registerChangeListener((t: Time) => SeasonRunner.runSeason(t));
    time.registerChangeListener((t: Time) => WeekRunner.runWeek(t));
    
    time = await initializeTime();

    // start scheduler
    if (TIME_USE_SCHEDULER) {
        const hourInMilliseconds = 60 * 60 * 1000;
        const interval = hourInMilliseconds / TIME_SPEEDUP_FACTOR;

        setInterval(async () => {
            await advanceTime();
        }, interval);
    }
}