import Footedness from "./Footedness";

/**
 * Core data contract for Player - defines what's exposed externally
 * Domain objects and API responses are derived from this
 */
export interface PlayerData {
    id?: number;
    name: string;
    age: number;
    footedness: Footedness;
    clubId?: number;
}
