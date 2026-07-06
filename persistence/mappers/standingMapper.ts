import Standing from "../../domainCore/Standing";
import { StandingEntityData } from "../entities/StandingEntity";

export const fromStandingEntity = (entity: StandingEntityData): Standing => {
    const standing = new Standing();
    standing.id = entity.id;
    standing.league = { id: entity.leagueId, name: entity.league?.name } as any;
    standing.club = { id: entity.clubId, name: entity.club?.name } as any;
    standing.week = entity.week;
    standing.points = entity.points;
    standing.wins = entity.wins;
    standing.draws = entity.draws;
    standing.losses = entity.losses;
    standing.goalsFor = entity.goalsFor;
    standing.goalsAgainst = entity.goalsAgainst;

    return standing;
}

export const toStandingEntityData = (standing: Standing): StandingEntityData => {
    const leagueId = standing.league?.id;
    const clubId = standing.club?.id;

    if (leagueId === undefined) throw new Error("Standing.league.id is required for persistence");
    if (clubId === undefined) throw new Error("Standing.club.id is required for persistence");

    return {
        id: standing.id,
        leagueId,
        clubId,
        week: standing.week,
        points: standing.points,
        wins: standing.wins,
        draws: standing.draws,
        losses: standing.losses,
        goalsFor: standing.goalsFor,
        goalsAgainst: standing.goalsAgainst
    };
}