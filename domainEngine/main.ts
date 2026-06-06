import { getCurrentTime, initializeTime, updateTime } from "../dataAccess/timeService";
import { eventNotifications } from "../dataAccess/eventNotifications";
import SeasonRunner from "./runners/seasonRunner";
import WeekRunner from "./runners/WeekRunner";
import { TIME_SPEEDUP_FACTOR, TIME_USE_SCHEDULER } from "../domainCore/domainProperties";

export const initializeDomain = async () => {
    eventNotifications.on("time.changed", (newTime) => SeasonRunner.runSeason(newTime));
    eventNotifications.on("club.created", () => SeasonRunner.updateClubSituation());

    WeekRunner.initialize();
    eventNotifications.on("time.changed", (newTime) => WeekRunner.runWeek(newTime));
    
    await initializeTime();
}

// started by SeasonRunner, if conditions met
export const startScheduler = async () => {
    if (TIME_USE_SCHEDULER) {

        const hourInMilliseconds = 60 * 60 * 1000;
        const interval = hourInMilliseconds / TIME_SPEEDUP_FACTOR;

        setInterval(async () => {
            const currentTime = await getCurrentTime();
            if (!currentTime) {
                return;
            }

            currentTime.advanceByAnHour();
            await updateTime(currentTime);
        }, interval);

        SeasonRunner.schedulerHasStarted = true;
    }
}