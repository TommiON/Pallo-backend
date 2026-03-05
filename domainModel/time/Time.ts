export default class Time {
    // Time is a singleton, only ever one Time exists in the database
    id: number = 1; 
    
    season: number;
    week: number;
    day: number;
    hour: number
}