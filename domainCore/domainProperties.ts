import { WeeklyDeadline } from "./WeeklyEvent";

export const GAME_DUMMY_MODE = true;

export const PLAYER_MIN_AGE = 16;
export const PLAYER_MAX_AGE = 80;
export const PLAYER_FOOTEDNESS_DISTRIBUTION_WEIGHTS_RIGHT_LEFT_BOTH = [70, 95, 100];
export const PLAYER_WEAK_SKILL_STARTING_RANGE = [1.0, 2.0];
export const PLAYER_AVERAGE_SKILL_STARTING_RANGE = [3.0, 4.0];
export const PLAYER_STRONG_SKILL_STARTING_RANGE = [5.0, 6.0];
export const PLAYER_SKILL_MAX = 30.0;

export const MATCH_GRANULARITY_MINUTES = 15;
export const MATCH_BALANCE_MIDFIELD_SHARE_OF_PLAY = 0.5;

export const CLUB_NUMBER_OF_PLAYERS_AT_START = 15;

// League properties: number of Clubs in a League, number of child Leagues per parent League, number of Clubs promoted from the top of a League
export const LEAGUE_NUMBER_OF_TEAMS = 4;
export const LEAGUE_SPAN_FACTOR = 2;
export const LEAGUE_PROMOTED_FROM_TOP = 1;

// tätä tarvitaan jos tehdään admin-endpoint API:iin
export const TIME_USE_SCHEDULER = true;
export const TIME_SPEEDUP_FACTOR = 9000; // 60 = one real minute is one hour in game time; 1 = real time

// schedule of WeeklyEvents
export const WEEKLY_YOUTH_ACADEMY_DRAW_DEADLINE: WeeklyDeadline = { day: 0, hour: 21 };
export const WEEKLY_FINANCES_SETUP_DEADLINE: WeeklyDeadline =     { day: 1, hour: 21 };
export const WEEKLY_TRAINING_SETUP_DEADLINE: WeeklyDeadline =     { day: 2, hour: 21 }; 
export const WEEKLY_TRANSFERS_DEADLINE: WeeklyDeadline =          { day: 3, hour: 21 };
export const WEEKLY_TRAINING: WeeklyDeadline =                    { day: 4, hour: 9 };
export const WEEKLY_MATCH_SETUP_DEADLINE: WeeklyDeadline =        { day: 5, hour: 20 };
export const WEEKLY_MATCH: WeeklyDeadline =                       { day: 5, hour: 21 };
export const WEEKLY_FINANCES_UPDATE: WeeklyDeadline =             { day: 6, hour: 9 };
