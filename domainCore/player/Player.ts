import Footedness from "./Footedness";
import Club from "../club/Club";
import { generatePlayerName, generatePlayerAge, generatePlayerFootedness} from "./playerFactoryUtils";
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

}