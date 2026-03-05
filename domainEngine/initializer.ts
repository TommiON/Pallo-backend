import { initializeTime } from "../services/timeService"

export const initializeDomain = async () => {
    console.log('kutsutaanko init?')
    await initializeTime();
}