import Club from "../club/Club";
import { getRandomNumberInRange } from "../../utils/randomizer";
import type { LeagueEntityData } from "../../persistence/entities/LeagueEntity";
import type { LeagueData } from "./LeagueData";

export default class League implements LeagueData {
    id?: number;

    season: number;
    divisionLevel: number;
    serialNumberOnDivisionLevel: number;

    promotesToId?: number;
    promotesTo: League | null;  // NOT in ILeagueData - internal only

    started: boolean;
    finished: boolean;

    clubs?: Club[];  // NOT in ILeagueData - internal only
    // matches?: Match[];
    // standings?: Standing[];

    constructor(season: number, divisionLevel: number, serialNumberOnDivisionLevel: number, promotesTo: League | null) {
        this.season = season;
        this.divisionLevel = divisionLevel;
        this.promotesTo = promotesTo;
        this.serialNumberOnDivisionLevel = serialNumberOnDivisionLevel;

        this.started = false;
        this.finished = false;
    }

    // Factory: Database entity → Domain object
    static fromEntity(entity: LeagueEntityData): League {
        const league = new League(entity.season, entity.divisionLevel, entity.serialNumberOnDivisionLevel, null);
        league.id = entity.id;
        league.promotesToId = entity.promotesToId;
        league.started = entity.started;
        league.finished = entity.finished;
        return league;
    }

    // Adapter: Domain object → Database entity
    toEntity(): LeagueEntityData {
        return {
            id: this.id,
            season: this.season,
            divisionLevel: this.divisionLevel,
            serialNumberOnDivisionLevel: this.serialNumberOnDivisionLevel,
            promotesToId: this.promotesToId,
            started: this.started,
            finished: this.finished
        };
    }
}