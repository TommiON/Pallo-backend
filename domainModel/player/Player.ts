import Footedness from "./Footedness";
import { generatePlayerName, generatePlayerAge } from "./playerFactoryUtils";

export default class Player {
    id?: number;
    name: string;
    age: number;

    footedness: Footedness;

    /*
    stamina: number;
    pace: number;
    strength: number;
    */

    constructor() {
        this.name = generatePlayerName();
        this.age = generatePlayerAge();
    }
}