import Club from "../../domainCore/Club";
import Player from "../../domainCore/Player";
import { CLUB_NUMBER_OF_PLAYERS_AT_START } from "../../domainCore/domainProperties";

export type ClubCreationResult = {
    club: Club;
    players: Player[];
}

export const createNewUserClub = (withName: string): ClubCreationResult => {
    const club = new Club(withName);

    const players: Player[] = [];
    for (let i = 0; i < CLUB_NUMBER_OF_PLAYERS_AT_START; i++) {
        const player = new Player();
        player.club = club;
        players.push(player);
    }

    return { club, players };
}