import Player from "../../domainModel/player/Player";

type OwnPlayer = Player;

type OthersPlayer = Player & {
    restricted: true
};
// muista myös mahdollisuus Omit<Player, 'footedness'>;

export type PlayerResponse = (OwnPlayer | OthersPlayer)[];