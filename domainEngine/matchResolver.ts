import Match from "../domainCore/Match";
import MatchEvent from "../domainCore/MatchEvent";
import { MATCH_DUMMY_MODE } from "../domainCore/domainProperties";

// ota dummyPlay() tänne ja poista play() Matchista

export type ResolvedMatch = {
    match: Match,
    event: MatchEvent[]
}

export const resolveMatch = (match: Match): ResolvedMatch => {
    if (MATCH_DUMMY_MODE) {
        // 
    } else {

    }

    return {
        match,
        event: []
    };
}