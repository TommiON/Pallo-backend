import { getRandomElement } from "../../utils/randomizer";
import { PLAYER_MIN_AGE, PLAYER_FOOTEDNESS_DISTRIBUTION_WEIGHTS_RIGHT_LEFT_BOTH } from "../../domainProperties/domainProperties";
import Footedness from "./Footedness";

export const generatePlayerName = (): string => {
    return getRandomElement(possibleFirstNames) + ' ' + getRandomElement(possibleLastNames);
}

export const generatePlayerAge = (): number => {
    return getRandomElement([PLAYER_MIN_AGE, PLAYER_MIN_AGE + 1, PLAYER_MIN_AGE + 2]);
}

export const generatePlayerFootedness = (): Footedness => {
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