import Match from "../../domainCore/Match";
import MatchEvent from "../../domainCore/MatchEvent";
import Tactics from "../../domainCore/Tactics";
import MatchNature from "../../domainCore/MatchNature";
import { getRandomNumberInRange } from "../../domainCore/domainUtils";
import { GAME_DUMMY_MODE, MATCH_GRANULARITY_MINUTES } from "../../domainCore/domainProperties";

// Tarvitaan jonkinlainen MatchSetup-domainolio, ne tänne parametreina
// lisäksi palautusarvo, jossa eventtien lisäksi balancet ja intensityt
type MatchResolutionResult = {
    phases: MatchNature[];
    events: MatchEvent[];
};

export const resolveMatch = (match: Match): MatchEvent[] => {
    const events: MatchEvent[] = [];
    events.push(...(GAME_DUMMY_MODE ? playDummy() : play(match, new Tactics(), new Tactics())));
    return events;
}

// kannasta luetut Tacticsit muuttuvat resolverin työmuistiksi (vaihdot, loukkaantumiset jne) jota ei kirjoiteta takaisin kantaan?
const play = (match: Match, homeTactics: Tactics, awayTactics: Tactics): MatchEvent[] => {
    // haettaisiinko taktiikat vasta täällä?
    let minute = 0;
    let step = MATCH_GRANULARITY_MINUTES;

    while (minute < 90) {
        // pääluuppi
        let nextPhaseInMatch = new MatchNature(match, minute);
       
        // step += MatchNaturen (endminute - startminute)
        minute += step;
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