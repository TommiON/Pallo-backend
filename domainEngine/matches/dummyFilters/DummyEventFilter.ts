import MatchEvent from "../../../domainCore/MatchEvent";
import { MatchResolverFilter, MatchResolverFilterResult, } from "../MatchResolverFilter";
import { getRandomNumberInRange, getRandomElement } from "../../../domainCore/domainUtils";
import { getALegalMinuteForEvent } from "../utils/matchResolverUtils";

// creates random dummy events (just goals for now)
class DummyEventFilter extends MatchResolverFilter {
    protected process(input: MatchResolverFilterResult): MatchResolverFilterResult {
        const matchEvents: MatchEvent[] = [...input.matchEvents];

        for (let i = 0; i < 3; i++) {
            const goalScored = getRandomElement([true, false], [20,80]);
        
            if (goalScored) {
                const homeOrAway = getRandomElement(['home', 'away']);
                matchEvents.push(new MatchEvent(
                    'goal',
                    getALegalMinuteForEvent({
                        ...input,
                        matchEvents,
                    }),
                    homeOrAway)
                );
            }
        }

        return {
            ...input,
            matchEvents,
        };
    }
}

export default DummyEventFilter;