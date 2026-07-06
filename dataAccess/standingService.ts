import Standing from "../domainCore/Standing";
import { StandingStorePort } from "./ports/standingPorts";

/**
 * Saves a Standing to the database.
 */
export const saveStanding = async (standing: Standing): Promise<Standing> => {
    return getConfiguredStandingService().saveStanding(standing);
};

/**
 * Finds Standings by the League ID and week number.
 */
export const findStandingsByLeagueIdAndWeek = async (leagueId: number, week: number): Promise<Standing[]> => {
    return getConfiguredStandingService().findStandingsByLeagueIdAndWeek(leagueId, week);
};

/**
 * Finds a Standing by the League ID and Club ID.
 */
export const findStandingByLeagueIdAndClubIdAndWeek = async (leagueId: number, clubId: number, week: number): Promise<Standing | null> => {
    return getConfiguredStandingService().findStandingByLeagueIdAndClubIdAndWeek(leagueId, clubId, week);
};


export type StandingServicePorts = {
    standingStore: StandingStorePort;
};

export const createStandingService = ({ standingStore }: StandingServicePorts) => ({
    saveStanding: async (standing: Standing): Promise<Standing> => {
        return standingStore.save(standing);
    },

    findStandingsByLeagueIdAndWeek: async (leagueId: number, week: number): Promise<Standing[]> => {
        return standingStore.findByLeagueIdAndWeek(leagueId, week);
    },

    findStandingByLeagueIdAndClubIdAndWeek: async (leagueId: number, clubId: number, week: number): Promise<Standing | null> => {
        return standingStore.findByLeagueIdAndClubIdAndWeek(leagueId, clubId, week);
    }
});

type StandingService = ReturnType<typeof createStandingService>;

let standingService: StandingService | null = null;

export const configureStandingService = (ports: StandingServicePorts): void => {
    standingService = createStandingService(ports);
};

const getConfiguredStandingService = (): StandingService => {
    if (!standingService) {
        throw new Error("Standing service not configured");
    }

    return standingService;
}