import Club from "./Club";
import { getRandomElement, getRandomNumberInRange } from "./domainUtils";
import { PLAYER_MIN_AGE, PLAYER_FOOTEDNESS_DISTRIBUTION_WEIGHTS_RIGHT_LEFT_BOTH, PLAYER_WEAK_SKILL_STARTING_RANGE, 
    PLAYER_AVERAGE_SKILL_STARTING_RANGE, PLAYER_STRONG_SKILL_STARTING_RANGE } from "./domainProperties";

// Core data contract for Player - defines what's exposed externally
export interface PlayerData {
    id?: number;
    name: string;
    age: number;
    footedness: Footedness;
    stamina: number;
    pace: number;
    strength: number;
    height: number;
    positioning: number;
    vision: number;
    shooting: number;
    heading: number;
    passing: number;
    tackling: number;
    ballControl: number;
    dribbling: number;
    shotStopping: number;
}

export default class Player implements PlayerData {
    id?: number;
    name: string;
    age: number;
    club?: Club;

    footedness: Footedness;

    // physical skills
    stamina: number;
    pace: number;
    strength: number;
    height: number;

    // tactical skills
    positioning: number;
    vision: number;

    // technical skills
    shooting: number;
    heading: number;
    passing: number;
    tackling: number;
    ballControl: number;
    dribbling: number;
    shotStopping: number;
    
    // myöhemmin: experience: number;
    // myöhemmin traits: Trait[]

    constructor() {
        this.name = generatePlayerName();
        this.age = generatePlayerAge();
        this.footedness = generatePlayerFootedness();

        const skills = generateSkills();

        this.stamina = skills.stamina;
        this.pace = skills.pace;
        this.strength = skills.strength;
        this.height = skills.height;

        this.positioning = skills.positioning;
        this.vision = skills.vision;

        this.shooting = skills.shooting;
        this.heading = skills.heading;
        this.passing = skills.passing;
        this.tackling = skills.tackling;
        this.ballControl = skills.ballControl;
        this.dribbling = skills.dribbling;
        this.shotStopping = skills.shotStopping;
    }
}

const generatePlayerName = (): string => {
    return getRandomElement(possibleFirstNames) + ' ' + getRandomElement(possibleLastNames);
}

const generatePlayerAge = (): number => {
    return getRandomElement([PLAYER_MIN_AGE, PLAYER_MIN_AGE + 1, PLAYER_MIN_AGE + 2]);
}

export type Footedness = 'right' | 'left' | 'both';

const generatePlayerFootedness = (): Footedness => {
    return getRandomElement(['right', 'left', 'both'], PLAYER_FOOTEDNESS_DISTRIBUTION_WEIGHTS_RIGHT_LEFT_BOTH);
}

type Skillset = {
    // physical
    stamina: number;
    pace: number;
    strength: number;
    height: number;

    // tactical
    positioning: number;
    vision: number;

    // technical
    shooting: number;
    heading: number;
    passing: number;
    tackling: number;
    ballControl: number;
    dribbling: number;
    shotStopping: number;
};

const generateSkills = (): Skillset => {
    const skillset: Partial<Skillset> = {};

    const playerCharacter = getRandomElement(['neutral', 'giant', 'speedster', 'spanishMidfielderType', 'shit', 'goalie'], [50, 10, 10, 10, 10, 10]);

    switch (playerCharacter) {
        case 'giant':
            skillset.height = getRandomNumberInRange(190, 200);

            skillset.heading = getRandomElement(PLAYER_STRONG_SKILL_STARTING_RANGE);
            skillset.strength = getRandomElement(PLAYER_STRONG_SKILL_STARTING_RANGE);
            skillset.tackling = getRandomElement(PLAYER_STRONG_SKILL_STARTING_RANGE);

            skillset.dribbling = getRandomElement(PLAYER_WEAK_SKILL_STARTING_RANGE);
            
            break;
        case 'goalie':
            skillset.height = getRandomNumberInRange(190, 200);

            skillset.shotStopping = getRandomElement(PLAYER_STRONG_SKILL_STARTING_RANGE);
            
            break;
        case 'spanishMidfielderType':
            skillset.height = getRandomNumberInRange(160, 175);

            skillset.passing = getRandomElement(PLAYER_STRONG_SKILL_STARTING_RANGE);
            skillset.vision = getRandomElement(PLAYER_STRONG_SKILL_STARTING_RANGE);
            skillset.dribbling = getRandomElement(PLAYER_STRONG_SKILL_STARTING_RANGE);
            skillset.ballControl = getRandomElement(PLAYER_STRONG_SKILL_STARTING_RANGE);

            skillset.strength = getRandomElement(PLAYER_WEAK_SKILL_STARTING_RANGE);
            
            break;
        case 'speedster':
            skillset.pace = getRandomElement(PLAYER_STRONG_SKILL_STARTING_RANGE);
            skillset.dribbling = getRandomElement(PLAYER_STRONG_SKILL_STARTING_RANGE);

            skillset.strength = getRandomElement(PLAYER_WEAK_SKILL_STARTING_RANGE);
            
            break;
        case 'shit':
            skillset.positioning = getRandomElement(PLAYER_WEAK_SKILL_STARTING_RANGE);
            skillset.vision = getRandomElement(PLAYER_WEAK_SKILL_STARTING_RANGE);
            skillset.shooting = getRandomElement(PLAYER_WEAK_SKILL_STARTING_RANGE);
            skillset.heading = getRandomElement(PLAYER_WEAK_SKILL_STARTING_RANGE);
            skillset.passing = getRandomElement(PLAYER_WEAK_SKILL_STARTING_RANGE);
            skillset.tackling = getRandomElement(PLAYER_WEAK_SKILL_STARTING_RANGE);
            skillset.ballControl = getRandomElement(PLAYER_WEAK_SKILL_STARTING_RANGE);
            skillset.dribbling = getRandomElement(PLAYER_WEAK_SKILL_STARTING_RANGE);
            skillset.shotStopping = getRandomElement(PLAYER_WEAK_SKILL_STARTING_RANGE);
            
            break;
    }

    const fullRange = PLAYER_WEAK_SKILL_STARTING_RANGE.concat(PLAYER_AVERAGE_SKILL_STARTING_RANGE).concat(PLAYER_STRONG_SKILL_STARTING_RANGE);

    skillset.stamina ? skillset.stamina : skillset.stamina = getRandomElement(fullRange);
    skillset.pace ? skillset.pace : skillset.pace = getRandomElement(fullRange);
    skillset.strength ? skillset.strength : skillset.strength = getRandomElement(fullRange);    
    skillset.height ? skillset.height : skillset.height = getRandomNumberInRange(160, 200);

    skillset.positioning ? skillset.positioning : skillset.positioning = getRandomElement(fullRange);
    skillset.vision ? skillset.vision : skillset.vision = getRandomElement(fullRange);

    skillset.shooting ? skillset.shooting : skillset.shooting = getRandomElement(fullRange);
    skillset.heading ? skillset.heading : skillset.heading = getRandomElement(fullRange);
    skillset.passing ? skillset.passing : skillset.passing = getRandomElement(fullRange);
    skillset.tackling ? skillset.tackling : skillset.tackling = getRandomElement(fullRange);
    skillset.ballControl ? skillset.ballControl : skillset.ballControl = getRandomElement(fullRange);
    skillset.dribbling ? skillset.dribbling : skillset.dribbling = getRandomElement(fullRange);
    skillset.shotStopping ? skillset.shotStopping : skillset.shotStopping = getRandomElement(fullRange);

    return skillset as Skillset;
}

const possibleFirstNames = ['Tommi', 'Hannu', 'Orlando', 'Peter', 'Pauli', 'Otso', 'Kauko', 'Kaspar', 'Juho', 'Jyrki',
    'Panu', 'Jarkko', 'Tuomas', 'Krister', 'Jaakko', 'Iivari', 'Lauri', 'Iivari', 'Otso', 'Jani', 'Jami',
    'Teemu', 'Jaakob', 'Atso', 'Aaron', 'Baltasar', 'Christian', 'Eero', 'Frans', 'Eemeli', 'Taavi', 'Petteri',
    'Akseli', 'Harry', 'Edgar', 'Tero', 'Jonne', 'Veeti', 'Daniel', 'Armo', 'Rauno', 'Aatos', 'Adolf', 'Juhani', 'Juha',
    'Toivo', 'Viljami', 'Jalmari', 'Eemil', 'Eino', 'Aapo', 'Aleksi', 'Aleksanteri', 'Aleksis', 'Alfred',
    'Alvar', 'Antero', 'Antti', 'Armas', 'Arvo', 'Aslak', 'Atte', 'Eelis', 'Eetu',
    'Einojuhani', 'Esa', 'Esko', 'Esko-Pekka', 'Pekka', 'Esa-Pekka', 'Esa-Matti', 'Esa-Mikael', 'Esa-Kalevi', 'Esa-Kristian', 'Esa-Juhani', 'Esa-Jukka', 
    'Esa-Jari'
];

const possibleLastNames = ['Niittymies', 'Ström', 'Gyllenbögel', 'Virtanen', 'Lahtinen', 'Alm', 'Kafka', 'Heiskanen',
    'Paananen', 'Lifländer', 'Piilonen', 'de Fresnes', 'Tuunala', 'Alavirta', 'Yrjölä', 'Mäkinen', 'Laakso',
    'Känninen', 'Kanninen', 'Arbakus', 'Aho', 'Ahola', 'Calonius', 'Erämetsä', 'Sillanpää', 'Airaksinen',
    'Jalonen', 'Iijoki', 'Manninen', 'Mäkelä', 'Persender', 'Salonius', 'Salonen', 'Tanhuanpää', 'Hara', 'Lampola',
    'Pankala', 'Janatuinen', 'Peltola', 'Tiitinen', 'Vänttilä', 'Vänttinen', 'Okkonen', 'Ruokolahti', 'Partanen', 'Koskinen', 'Koskela',
    'Supinen', 'Aatsalo', 'Halla-aho', 'Rantanen', 'Ranta', 'Rantala', 'Rantamäki', 'Rantakari', 'Rantakoski', 'Iiviäinen', 'Iivonen'
]