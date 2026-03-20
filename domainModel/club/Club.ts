import Player from "../player/Player";
import League from "../league/League";
import { hashPassword } from "../../utils/passwordUtils";
import { getRandomNumberInRange } from "../../utils/randomizer";
import type { ClubEntityData } from "../../persistence/entities/ClubEntity";
import type { ClubData } from "./ClubData";

export default class Club implements ClubData {
    id?: number;
    name: string;
    passwordHash?: string;
    established: Date;
    zombie: boolean;
    players?: Player[];
    leagues?: League[];

    // must use factory method instead of constructor because of async password hashing
    static create = async (name: string, password: string): Promise<Club> => {
        const club = new Club();

        club.name = name;
        club.passwordHash = await hashPassword(password);
        club.established = new Date();
        club.zombie = false;

        return club;
    }

    static createZombie = (): Club => {
        const club = new Club();

        club.name = 'FC Zombie ' + getRandomNumberInRange(1, 10000000000);
        club.established = new Date();
        club.zombie = true;

        return club;
    }

    // Factory: Database entity → Domain object
    static fromEntity(entity: ClubEntityData): Club {
        const club = new Club();
        club.id = entity.id;
        club.name = entity.name;
        club.passwordHash = entity.passwordHash;
        club.established = entity.established;
        club.zombie = entity.zombie;
        return club;
    }

    // Adapter: Domain object → Database entity
    toEntity(): ClubEntityData {
        return {
            id: this.id,
            name: this.name,
            passwordHash: this.passwordHash,
            established: this.established,
            zombie: this.zombie
        };
    }
}