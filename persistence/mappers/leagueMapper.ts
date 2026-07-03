import League from "../../domainCore/League";
import type { LeagueEntityData } from "../entities/LeagueEntity";
import type { MatchEntityData } from "../entities/MatchEntity";
import { fromMatchEntity } from "./matchMapper";

export const fromLeagueEntity = (entity: LeagueEntityData): League => {
    const league = new League(entity.season, entity.divisionLevel, entity.serialNumberOnDivisionLevel, null);
    league.id = entity.id;
    // promotesTo is left null here; callers that load a full graph should use wireLeagueGraph
    league.started = entity.started;
    league.finished = entity.finished;
    league.clubs = entity.clubs;
    league.fixtures = (entity.matches as MatchEntityData[] | undefined)?.map((matchEntity) => fromMatchEntity(matchEntity));
    return league;
};

export const toLeagueEntityData = (league: League): LeagueEntityData => {
    return {
        id: league.id,
        season: league.season,
        divisionLevel: league.divisionLevel,
        serialNumberOnDivisionLevel: league.serialNumberOnDivisionLevel,
        promotesToId: league.promotesTo?.id,
        started: league.started,
        finished: league.finished
    };
};
