import Match from "../../domainCore/Match";
import MatchEvent from "../../domainCore/MatchEvent";
import { getRandomNumberInRange } from "../../domainCore/domainUtils";
import { MATCH_DUMMY_MODE } from "../../domainCore/domainProperties";

// Tarvitaan jonkinlainen MatchSetup-domainolio, ne tänne parametreina
export const resolveMatch = (): MatchEvent[] => {
    const events: MatchEvent[] = [];
    events.push(...(MATCH_DUMMY_MODE ? playDummy() : play()));
    return events;
}

const play = (): MatchEvent[] => {
    return [];
}

const playDummy = (): MatchEvent[] => {
    const events: MatchEvent[] = [];

    const numberOfHomeGoals = getRandomNumberInRange(0, 3);
    const numberOfAwayGoals = getRandomNumberInRange(0, 3);

    for (let i = 0; i < numberOfHomeGoals; i++) {
        events.push(new MatchEvent('goal', getRandomNumberInRange(1, 90), 'home'));
    }

    for (let i = 0; i < numberOfAwayGoals; i++) {
        events.push(new MatchEvent('goal', getRandomNumberInRange(1, 90), 'away'));
    }

    return events;
}