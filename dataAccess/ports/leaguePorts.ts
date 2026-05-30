import League from "../../domainModel/league/League";

export interface LeagueStorePort {
    save(league: League): Promise<League>;
    findBySeason(season: number): Promise<League[]>;
    findBySeasonAndDivisionalPosition(
        season: number,
        divisionLevel: number,
        serialNumberOnDivisionLevel: number
    ): Promise<League | null>;
    findChildrenForLeague(leagueId: number): Promise<League[]>;
}

export interface LeagueTransactionalStorePort extends LeagueStorePort {
    addClubsToLeague(leagueId: number, clubIds: number[]): Promise<void>;
}

export interface LeagueTransactionPort {
    runInTransaction<T>(operation: (store: LeagueTransactionalStorePort) => Promise<T>): Promise<T>;
}
