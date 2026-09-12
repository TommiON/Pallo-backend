import Match from "../../domainCore/Match";
import MatchEvent from "../../domainCore/MatchEvent";
import Tactics from "../../domainCore/Tactics";
import { getRandomNumberInRange } from "../../domainCore/domainUtils";
import { GAME_DUMMY_MODE, MATCH_GRANULARITY_MINUTES } from "../../domainCore/domainProperties";

// Tarvitaan jonkinlainen MatchSetup-domainolio, ne tänne parametreina
// lisäksi palautusarvo, jossa eventtien lisäksi balancet ja intensityt
export const resolveMatch = (): MatchEvent[] => {
    const events: MatchEvent[] = [];
    events.push(...(GAME_DUMMY_MODE ? playDummy() : play(new Tactics(), new Tactics())));
    return events;
}

// kannasta luetut Tacticsit muuttuvat resolverin työmuistiksi (vaihdot, loukkaantumiset jne) jota ei kirjoiteta takaisin kantaan
const play = (homeTactics: Tactics, awayTactics: Tactics): MatchEvent[] => {
    for (let minute = 0; minute < 90; minute += MATCH_GRANULARITY_MINUTES) {
        // pääluuppi
    }

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