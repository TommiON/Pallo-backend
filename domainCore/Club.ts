import Player from "./Player";
import League from "./League";
import { hashPassword } from "../controllers/passwordUtils";
import { getRandomNumberInRange } from "./domainUtils";

// Core data contract for Club - defines what's exposed externally
export interface ClubData {
    id?: number;
    name: string;
    passwordHash?: string;
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
    // there will be more properties that are other DomainObjects (WeeklyBudget) or list of other DomainObjects

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