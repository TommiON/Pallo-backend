import Club from "../domainModel/club/Club";
import Player from "../domainModel/player/Player";
import { CLUB_NUMBER_OF_PLAYERS_AT_START } from "../domainProperties/domainProperties";
import { clubRepository, playerRepository } from "../persistence/repositories/repositories";

export const createClub = async(name: string, password: string): Promise<Club> => {
    const club = await Club.create(name, password);
    const savedClub = await clubRepository.save(club);

    const players: Player[] = [];
    for (let i = 0; i < CLUB_NUMBER_OF_PLAYERS_AT_START; i++) {
        const p = new Player();
        p.clubId = savedClub.id;
        p.club = savedClub;
        players.push(p);
    }

    const savedPlayers = await playerRepository.save(players);

    return savedClub;
};