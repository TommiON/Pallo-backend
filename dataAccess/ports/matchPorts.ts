import Match from "../../domainCore/Match";

export interface MatchStorePort {
    save(match: Match): Promise<Match>;
    findById(id: number): Promise<Match | null>;
    findByLeagueId(leagueId: number): Promise<Match[]>;
    findByLeagueIdAndWeek(leagueId: number, week: number): Promise<Match[]>;
    findBySeasonAndWeek(season: number, week: number): Promise<Match[]>;
}

export interface MatchTransactionalStorePort extends MatchStorePort {
    saveMatches(matches: Match[]): Promise<void>;
}

export interface MatchTransactionPort {
    runInTransaction<T>(operation: (store: MatchTransactionalStorePort) => Promise<T>): Promise<T>;
}