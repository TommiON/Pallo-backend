import Match from "../../domainCore/Match";
import MatchEvent from "../../domainCore/MatchEvent";
import Tactics from "../../domainCore/Tactics";
import MatchNature from "../../domainCore/MatchNature";
import { getRandomNumberInRange } from "../../domainCore/domainUtils";
import { GAME_DUMMY_MODE } from "../../domainCore/domainProperties";

// Tarvitaan jonkinlainen MatchSetup-domainolio, ne tänne parametreina
// lisäksi palautusarvo, jossa eventtien lisäksi balancet ja intensityt
type MatchResolutionResult = {
    phases: MatchNature[];
    events: MatchEvent[];
};

const FULL_TIME_MINUTE = 90;
const TIME_COMPARISON_EPSILON = 1e-9;

export const resolveMatch = (match: Match): MatchEvent[] => {
    const events: MatchEvent[] = [];
    events.push(...(GAME_DUMMY_MODE ? playDummy() : play(match, new Tactics(), new Tactics())));
    return events;
}

// kannasta luetut Tacticsit muuttuvat resolverin työmuistiksi (vaihdot, loukkaantumiset jne) jota ei kirjoiteta takaisin kantaan?
const play = (match: Match, homeTactics: Tactics, awayTactics: Tactics): MatchEvent[] => {
    // haettaisiinko taktiikat vasta täällä?
    let minute = 0;

    while (minute < (FULL_TIME_MINUTE - TIME_COMPARISON_EPSILON)) {       
        let currentPhaseInMatch = new MatchNature(match, minute);
        // filter chain may alter the nextPhaseInMatch...

        // defensive checks that should not ever be triggered if MatchNature behaves, but just in case...
        if (currentPhaseInMatch.endMinute <= (minute + TIME_COMPARISON_EPSILON)) {
            throw new Error("Match resolver phase did not advance time");
        }

        if (currentPhaseInMatch.endMinute > (FULL_TIME_MINUTE + TIME_COMPARISON_EPSILON)) {
            throw new Error("Match resolver phase advanced beyond full time");
        }

        minute = currentPhaseInMatch.endMinute;
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

export const matchResolverDev = {
    play,
    playDummy,
};
