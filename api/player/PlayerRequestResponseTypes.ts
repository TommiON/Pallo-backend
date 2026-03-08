import type { PlayerData } from "../../domainModel/player/PlayerData";

export type PlayerResponse = (PlayerData & { restricted: boolean })[];

export type PlayersByIdsRequest = {
    ids: number[];
}