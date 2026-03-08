import Footedness from "./Footedness";
import Club from "../club/Club";
import { generatePlayerName, generatePlayerAge, generatePlayerFootedness} from "./playerFactoryUtils";
import type { PlayerEntityData } from "../../persistence/entities/PlayerEntity";
import type { PlayerData } from "./PlayerData";

export default class Player implements PlayerData {
    id?: number;
    name: string;
    age: number;
    footedness: Footedness;
    clubId?: number;
    club?: Club;

    /*
    stamina: number;
    pace: number;
    strength: number;
    */

    constructor() {
        this.name = generatePlayerName();
        this.age = generatePlayerAge();
        this.footedness = generatePlayerFootedness();
    }

    // Factory: Database entity → Domain object
    static fromEntity(entity: PlayerEntityData): Player {
        const player = new Player();
        player.id = entity.id;
        player.name = entity.name;
        player.age = entity.age;
        player.footedness = entity.footedness as Footedness;
        player.clubId = entity.clubId;
        return player;
    }

    // Adapter: Domain object → Database entity
    toEntity(): PlayerEntityData {
        return {
            id: this.id,
            name: this.name,
            age: this.age,
            footedness: this.footedness,
            clubId: this.clubId
        };
    }
}