import Player from "../../domainModel/player/Player";

export type LargeResponse = Player & {
    team: string;
    position: string;
    stats: {
        stamina: number;
        pace: number;
        strength: number;
    };
};

export type StrippedResponse = Omit<Player, 'footedness'>;

export type PlayerListResponse = (LargeResponse | StrippedResponse)[];