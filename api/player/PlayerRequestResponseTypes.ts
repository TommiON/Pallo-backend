import type { PlayerData } from "../../domainCore/player/PlayerData";

export type PlayerResponse = (PlayerData & { restricted: boolean })[];

export type PlayersByIdsRequest = {
    ids: number[];
}