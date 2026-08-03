import Player from "../../domainCore/Player";
import { Footedness } from "../../domainCore/Player";
import Club from "../../domainCore/Club";
import type { PlayerEntityData } from "../entities/PlayerEntity";

export const fromPlayerEntity = (entity: PlayerEntityData): Player => {
    const player = new Player();
    player.id = entity.id;
    player.name = entity.name;
    player.age = entity.age;
    player.footedness = entity.footedness as Footedness;
    if (entity.clubId !== undefined) {
        player.club = { id: entity.clubId } as Club;
    }
    return player;
};

export const toPlayerEntityData = (player: Player): PlayerEntityData => {
    return {
        id: player.id,
        name: player.name,
        age: player.age,
        footedness: player.footedness,
        clubId: player.club?.id,
        stamina: player.stamina,
        pace: player.pace,
        strength: player.strength,
        height: player.height,
        positioning: player.positioning,
        vision: player.vision,
        shooting: player.shooting,
        heading: player.heading,
        passing: player.passing,
        tackling: player.tackling,
        ballControl: player.ballControl,
        dribbling: player.dribbling,
        shotStopping: player.shotStopping
    };
};
