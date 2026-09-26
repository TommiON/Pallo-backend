import { MatchResolverFilter, MatchResolverFilterResult } from "../MatchResolverFilter";
import { getRandomElement } from "../../../domainCore/domainUtils";

// randomly adjusts the intensity
class DummyIntensityFilter extends MatchResolverFilter {
    protected process(input: MatchResolverFilterResult): MatchResolverFilterResult {
        const newIntensity = getRandomElement(['increased', 'superincreased', 'decreased', 'superdecreased', 'unchanged§']);

        if (newIntensity === 'increased') {
            input.currentMatchNature.intensityUp();
        } else if (newIntensity === 'superincreased') {
            input.currentMatchNature.intensityUp();
            input.currentMatchNature.intensityUp();
        } else if (newIntensity === 'decreased') {
            input.currentMatchNature.intensityDown();
        } else if (newIntensity === 'superdecreased') {
            input.currentMatchNature.intensityDown();
            input.currentMatchNature.intensityDown();
        }

        return input;
    }
}

export default DummyIntensityFilter;