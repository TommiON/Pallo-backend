import Club from "../../domainCore/Club";
import League from "../../domainCore/League";
import Match from "../../domainCore/Match";
import type { MatchEntityData } from "../entities/MatchEntity";

export const fromMatchEntity = (entity: MatchEntityData): Match => {
    const homeClub = { id: entity.homeClubId } as Club;
    const awayClub = { id: entity.awayClubId } as Club;
    const league = { id: entity.leagueId } as League;

    const match = new Match(homeClub, awayClub, entity.week, league);
    match.id = entity.id;
    match.started = entity.started;
    match.finished = entity.finished;

    return match;
};

export const toMatchEntityData = (match: Match): MatchEntityData => {
    const homeClubId = match.homeClub?.id;
    const awayClubId = match.awayClub?.id;
    const leagueId = match.league?.id;

    if (homeClubId === undefined) throw new Error("Match.homeClub.id is required for persistence");
    if (awayClubId === undefined) throw new Error("Match.awayClub.id is required for persistence");
    if (leagueId === undefined) throw new Error("Match.league.id is required for persistence");

    return {
        id: match.id,
        leagueId,
        homeClubId,
        awayClubId,
        week: match.week,
        started: match.started,
        finished: match.finished
    };
};
