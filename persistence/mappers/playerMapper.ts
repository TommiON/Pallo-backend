import Player from "../../domainCore/player/Player";
import Footedness from "../../domainCore/player/Footedness";
import type { PlayerEntityData } from "../entities/PlayerEntity";

export const fromPlayerEntity = (entity: PlayerEntityData): Player => {
    const player = new Player();
    player.id = entity.id;
    player.name = entity.name;
    player.age = entity.age;
    player.footedness = entity.footedness as Footedness;
    player.clubId = entity.clubId;
    return player;
};

export const toPlayerEntityData = (player: Player): PlayerEntityData => {
    return {
        id: player.id,
        name: player.name,
        age: player.age,
        footedness: player.footedness,
        clubId: player.clubId
    };
};
