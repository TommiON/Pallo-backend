import Standing from "../../domainCore/Standing";

export interface StandingStorePort {
    save(standing: Standing): Promise<Standing>;
    findByLeagueIdAndWeek(leagueId: number, week: number): Promise<Standing[]>;
    findByLeagueIdAndClubIdAndWeek(leagueId: number, clubId: number, week: number): Promise<Standing | null>;
}

