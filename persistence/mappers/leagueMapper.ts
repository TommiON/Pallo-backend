import League from "../../domainModel/league/League";
import type { LeagueEntityData } from "../entities/LeagueEntity";

export const fromLeagueEntity = (entity: LeagueEntityData): League => {
    const league = new League(entity.season, entity.divisionLevel, entity.serialNumberOnDivisionLevel, null);
    league.id = entity.id;
    league.promotesToId = entity.promotesToId;
    league.started = entity.started;
    league.finished = entity.finished;
    league.clubs = entity.clubs;
    return league;
};

export const toLeagueEntityData = (league: League): LeagueEntityData => {
    return {
        id: league.id,
        season: league.season,
        divisionLevel: league.divisionLevel,
        serialNumberOnDivisionLevel: league.serialNumberOnDivisionLevel,
        promotesToId: league.promotesToId,
        started: league.started,
        finished: league.finished
    };
};
