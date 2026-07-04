import MatchEvent from "../../domainCore/MatchEvent";

export interface MatchEventStorePort {
    save(matchEvent: MatchEvent): Promise<MatchEvent>;
    findById(id: number): Promise<MatchEvent | null>;
    findByMatchId(matchId: number): Promise<MatchEvent[]>;
}

export interface MatchEventTransactionalStorePort extends MatchEventStorePort {
    saveMatchEvents(matchEvents: MatchEvent[]): Promise<void>;
}

export interface MatchEventTransactionPort {
    runInTransaction<T>(operation: (store: MatchEventTransactionalStorePort) => Promise<T>): Promise<T>;
}