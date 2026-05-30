import Club from "./club/Club";
import { getRandomElement } from "../utils/randomizer";
import { PLAYER_MIN_AGE, PLAYER_FOOTEDNESS_DISTRIBUTION_WEIGHTS_RIGHT_LEFT_BOTH } from "./domainProperties";

// Core data contract for Player - defines what's exposed externally
export interface PlayerData {
    id?: number;
    name: string;
    age: number;
    footedness: Footedness;
    clubId?: number;
}

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

export type Footedness = 'right' | 'left' | 'both';

const generatePlayerName = (): string => {
    return getRandomElement(possibleFirstNames) + ' ' + getRandomElement(possibleLastNames);
}

const generatePlayerAge = (): number => {
    return getRandomElement([PLAYER_MIN_AGE, PLAYER_MIN_AGE + 1, PLAYER_MIN_AGE + 2]);
}

const generatePlayerFootedness = (): Footedness => {
    return getRandomElement(['right', 'left', 'both'], PLAYER_FOOTEDNESS_DISTRIBUTION_WEIGHTS_RIGHT_LEFT_BOTH);
}

const possibleFirstNames = ['Tommi', 'Hannu', 'Orlando', 'Peter', 'Pauli', 'Otso', 'Kauko', 'Kaspar', 'Juho', 'Jyrki',
    'Panu', 'Jarkko', 'Tuomas', 'Krister', 'Jaakko', 'Iivari', 'Lauri', 'Iivari', 'Otso', 'Jani', 'Jami',
    'Teemu', 'Jaakob', 'Atso', 'Aaron', 'Baltasar', 'Christian', 'Eero', 'Frans', 'Eemeli', 'Taavi', 'Petteri',
    'Akseli', 'Harry', 'Edgar', 'Tero', 'Jonne', 'Veeti', 'Daniel', 'Armo', 'Rauno', 'Aatos', 'Adolf', 'Juhani', 'Juha'
];

const possibleLastNames = ['Niittymies', 'Ström', 'Gyllenbögel', 'Virtanen', 'Lahtinen', 'Alm', 'Kafka', 'Heiskanen',
    'Paananen', 'Lifländer', 'Piilonen', 'de Fresnes', 'Tuunala', 'Alavirta', 'Yrjölä', 'Mäkinen', 'Laakso',
    'Känninen', 'Kanninen', 'Arbakus', 'Aho', 'Ahola', 'Calonius', 'Erämetsä', 'Sillanpää', 'Airaksinen',
    'Jalonen', 'Iijoki', 'Manninen', 'Mäkelä', 'Persender', 'Salonius', 'Salonen', 'Tanhuanpää', 'Hara', 'Lampola',
    'Pankala', 'Janatuinen', 'Peltola'
];