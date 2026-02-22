import { getRandomElement } from "../../utils/randomizer";
import { PLAYER_MIN_AGE } from "../../domainProperties/domainProperties";

export const generatePlayerName = (): string => {
    return getRandomElement(possibleFirstNames) + ' ' + getRandomElement(possibleLastNames);
}

export const generatePlayerAge = (): number => {
    const ageRange = [PLAYER_MIN_AGE, PLAYER_MIN_AGE + 1, PLAYER_MIN_AGE +2];
    return getRandomElement(ageRange);
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