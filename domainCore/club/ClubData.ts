/**
 * Core data contract for Club - defines what's exposed externally
 * Domain objects and API responses are derived from this
 */
export interface ClubData {
    id?: number;
    name: string;
    passwordHash?: string;
    established: Date;
    zombie: boolean;
}
