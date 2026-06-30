import Player from "./Player";
import League from "./League";
import { getRandomNumberInRange } from "./domainUtils";

// Core data contract for Club - defines what's exposed externally
export interface ClubData {
    id?: number;
    name: string;
    established: Date;
    zombie: boolean;
}

export default class Club implements ClubData {
    id?: number;
    name: string;
    established: Date;
    zombie: boolean;
    players?: Player[];
    leagues?: League[];

    constructor(name: string, zombie: boolean = false) {
       if (zombie) {
           this.name = 'FC Zombie ' + getRandomNumberInRange(1, 10000000000);
           this.established = new Date();
           this.zombie = true;
       } else {
           this.name = name;
           this.established = new Date();
           this.zombie = false;
       }
    }
}