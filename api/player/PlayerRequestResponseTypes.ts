import type { PlayerData } from "../../domainCore/Player";

export type PlayerResponse = (PlayerData & { restricted: boolean })[];

export type PlayersByIdsRequest = {
    ids: number[];
}