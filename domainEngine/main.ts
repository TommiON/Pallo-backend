import Time from "../domainModel/time/Time";
import { advanceTime, initializeTime } from "../services/timeService"
import SeasonRunner from "./runners/SeasonRunner";
import WeekRunner from "./runners/WeekRunner";
import { TIME_SPEEDUP_FACTOR, TIME_USE_SCHEDULER } from "../domainProperties/domainProperties";

export const initializeAndStartDomain = async () => {
    let time = new Time();

    await SeasonRunner.initialize();
    WeekRunner.initialize();

    time.registerChangeListener((t: Time) => SeasonRunner.runSeason(t));
    time.registerChangeListener((t: Time) => WeekRunner.runWeek(t));
    
    time = await initializeTime();

    if (TIME_USE_SCHEDULER) {
        const hourInMilliseconds = 60 * 60 * 1000;
        const interval = hourInMilliseconds / TIME_SPEEDUP_FACTOR;

        setInterval(async () => {
            await advanceTime();
        }, interval);
    }
}