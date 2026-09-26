import { MatchResolverFilter, MatchResolverFilterResult } from "../MatchResolverFilter";
import { getRandomNumberInRange, getRandomElement } from "../../../domainCore/domainUtils";

// randomly adjusts midfield possession
class DummyPossessionFilter extends MatchResolverFilter {
    protected process(input: MatchResolverFilterResult): MatchResolverFilterResult {
        const change = getRandomElement(['homeDominance', 'awayDominance', 'noChange', 'noChange', 'noChange']);

        if (change === 'homeDominance') {
            input.currentMatchNature.pushForPossession('midfield', true);
        } else if (change === 'awayDominance') {
            input.currentMatchNature.pushForPossession('midfield', false);
        }

        return input;
    }
}

export default DummyPossessionFilter;