import { findMatchNaturesByMatchId } from "../dataAccess/matchNatureService";
import { findMatchById } from "../dataAccess/matchService";
import { findMatchEventsByMatchId } from "../dataAccess/matchEventService";
import { MatchEventData } from "../domainCore/MatchEvent";
import { MatchNatureData } from "../domainCore/MatchNature";

export type MatchReport = {
    matchId: number;
    homeTeam: string;
    homeTeamId: number;
    awayTeam: string;
    awayTeamId: number;
    phases: MatchNatureData[];
    events: MatchEventData[];
};

// Returns a composite object describing how a Match unfolded

export const getMatchReport = async (matchId: number): Promise<MatchReport|null> => {
    const match = await findMatchById(matchId);
    
    if (!match || !match.started) {
        return null;
    }

    const phases = await findMatchNaturesByMatchId(matchId);

    const events = await findMatchEventsByMatchId(matchId);

    return {
        matchId: match.id!,
        homeTeam: match.homeClub.name,
        homeTeamId: match.homeClub.id!,
        awayTeam: match.awayClub.name,
        awayTeamId: match.awayClub.id!,
        phases,
        events,
    };
};