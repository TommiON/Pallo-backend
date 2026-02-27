import Player from "../../domainModel/player/Player";

export type PlayerResponse = (Player & { restricted: boolean })[];