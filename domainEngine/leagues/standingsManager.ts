import Standing from "../../domainCore/Standing";
import Match from "../../domainCore/Match";
import { findStandingByLeagueIdAndClubIdAndWeek } from "../../dataAccess/standingService";

export type UpdatedStandings = {
    homeStanding: Standing;
    awayStanding: Standing;
};

export const updateStandingsAfterMatch = async (match: Match): Promise<UpdatedStandings> => {
    const oldHomeStanding = await findStandingByLeagueIdAndClubIdAndWeek(match.league!.id!, match.homeClub.id!, match.week - 1);
    const oldAwayStanding = await findStandingByLeagueIdAndClubIdAndWeek(match.league!.id!, match.awayClub.id!, match.week - 1);

    const matchResult = match.getResult();

    const newHomeStanding = new Standing();
    const newAwayStanding = new Standing();

    newHomeStanding.points = oldHomeStanding?.points ?? 0;
    newHomeStanding.wins = oldHomeStanding?.wins ?? 0;
    newHomeStanding.draws = oldHomeStanding?.draws ?? 0;
    newHomeStanding.losses = oldHomeStanding?.losses ?? 0;
    newHomeStanding.goalsFor = oldHomeStanding?.goalsFor ?? 0;
    newHomeStanding.goalsAgainst = oldHomeStanding?.goalsAgainst ?? 0;

    newAwayStanding.points = oldAwayStanding?.points ?? 0;
    newAwayStanding.wins = oldAwayStanding?.wins ?? 0;
    newAwayStanding.draws = oldAwayStanding?.draws ?? 0;
    newAwayStanding.losses = oldAwayStanding?.losses ?? 0;
    newAwayStanding.goalsFor = oldAwayStanding?.goalsFor ?? 0;
    newAwayStanding.goalsAgainst = oldAwayStanding?.goalsAgainst ?? 0;

    if (matchResult.homeGoals > matchResult.awayGoals) {
        newHomeStanding.points += 3;
        newHomeStanding.wins += 1;
        newAwayStanding.losses += 1;
    } else if (matchResult.homeGoals < matchResult.awayGoals) {
        newAwayStanding.points += 3;
        newAwayStanding.wins += 1;
        newHomeStanding.losses += 1;
    } else {
        newHomeStanding.points += 1;
        newHomeStanding.draws += 1;
        newAwayStanding.points += 1;
        newAwayStanding.draws += 1;
    }

    newHomeStanding.goalsFor += matchResult.homeGoals;
    newHomeStanding.goalsAgainst += matchResult.awayGoals;

    newAwayStanding.goalsFor += matchResult.awayGoals;
    newAwayStanding.goalsAgainst += matchResult.homeGoals;

    newHomeStanding.league = match.league!;
    newHomeStanding.club = match.homeClub;
    newHomeStanding.week = match.week;

    newAwayStanding.league = match.league!;
    newAwayStanding.club = match.awayClub;
    newAwayStanding.week = match.week;

    return {
        homeStanding: newHomeStanding,
        awayStanding: newAwayStanding
    };
}

export const compareStandings = (a: Standing, b: Standing): number => {
    return 0;
}