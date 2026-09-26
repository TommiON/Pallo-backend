import { MatchResolverFilterResult } from "../MatchResolverFilter";
import { getRandomNumberInRange, getRandomElement } from "../../../domainCore/domainUtils";

// Pitää miettiä sofistikoituneempi logiikka, nyt rajoittaa vain alkuminuutin (MatchNature tai viimeisin Event) ja loppuminuutin välille
export const getALegalMinuteForEvent = (input: MatchResolverFilterResult): number => {
    const phaseStart = input.currentMatchNature.startMinute;
    const latestEvent = input.matchEvents.length > 0 ? input.matchEvents[input.matchEvents.length - 1].minute : null;
    const phaseEnd = input.currentMatchNature.endMinute;
    const earliestLegalMinute = latestEvent === null
        ? phaseStart
        : Math.max(phaseStart, latestEvent + 1);
    
    return getRandomNumberInRange(earliestLegalMinute, phaseEnd);
};