import Player from "../../domainModel/player/Player";

export type PlayerResponse = (Player & { 
    restricted: boolean }
)[];

export type PlayersByIdsRequest = {
    ids: number[];
}