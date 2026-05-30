import Player from "../../domainCore/player/Player";

export interface PlayerStorePort {
    findByIds(ids: number[]): Promise<Player[]>;
}
