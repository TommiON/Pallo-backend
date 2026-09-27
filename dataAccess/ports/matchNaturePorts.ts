import MatchNature from "../../domainCore/MatchNature";

export interface MatchNatureStorePort {
    save(matchNature: MatchNature): Promise<MatchNature>;
    findById(id: number): Promise<MatchNature | null>;
    findByMatchId(matchId: number): Promise<MatchNature[]>;
}

export interface MatchNatureTransactionalStorePort extends MatchNatureStorePort {
    saveMatchNatures(matchNatures: MatchNature[]): Promise<void>;
}

export interface MatchNatureTransactionPort {
    runInTransaction<T>(operation: (store: MatchNatureTransactionalStorePort) => Promise<T>): Promise<T>;
}