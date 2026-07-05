import Standing from "../../domainCore/Standing";

export interface StandingStorePort {
    save(standing: Standing): Promise<Standing>;
    findByLeagueIdAndWeek(leagueId: number, week: number): Promise<Standing[]>;
    findByLeagueIdAndClubId(leagueId: number, clubId: number): Promise<Standing | null>;
}

