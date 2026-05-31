import Time from "../../domainCore/Time";

export interface TimeStorePort {
    getCurrent(): Promise<Time | null>;
    getCurrentForUpdate(): Promise<Time | null>;
    insertIfMissing(initialTime: Time): Promise<void>;
    save(time: Time): Promise<Time>;
}

export interface TimeTransactionPort {
    runInTransaction<T>(operation: (store: TimeStorePort) => Promise<T>): Promise<T>;
}

export interface TimeEventsPort {
    emitTimeChanged(time: Time): void;
}
