import { WeeklyEvent } from "../domainCore/WeeklyEvent";
import { initializeDomain } from "../domainEngine/main";
// TODO: nämä eivät ole DomainPropertyja, laita enviin ja mietin envin sijainti
import { TIME_SPEEDUP_FACTOR, TIME_USE_SCHEDULER } from "../domainCore/domainProperties";

const weeklySchedule: WeeklyEvent[];

export const initializeScheduler = () => {}

export const startScheduler = () => {
    if (TIME_USE_SCHEDULER) {
            const hourInMilliseconds = 60 * 60 * 1000;
            const interval = hourInMilliseconds / TIME_SPEEDUP_FACTOR;
    
            setInterval(async () => {
                await tick();
            }, interval);
    }
}

const tick = async () => {
    
}