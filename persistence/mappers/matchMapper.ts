import Club from "../../domainCore/club/Club";
import League from "../../domainCore/league/League";
import Match from "../../domainCore/match/Match";
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
    const homeClubId = match.homeClubId ?? match.homeClub?.id;
    const awayClubId = match.awayClubId ?? match.awayClub?.id;
    const leagueId = match.leagueId ?? match.league?.id;

    return {
        id: match.id,
        leagueId: leagueId!,
        homeClubId: homeClubId!,
        awayClubId: awayClubId!,
        week: match.week,
        started: match.started,
        finished: match.finished
    };
};
