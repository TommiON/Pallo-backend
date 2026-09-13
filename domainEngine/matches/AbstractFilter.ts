import MatchNature from "../../domainCore/MatchNature";
import MatchEvent from "../../domainCore/MatchEvent";
import Tactics from "../../domainCore/Tactics";

export type FilterResult = {
    homeTactics: Tactics;
    awayTactics: Tactics;
    matchNatures: MatchNature[];
    matchEvents: MatchEvent[];
}

// Base class for all match resolver filters
abstract class MatchResolverFilter {
    protected nextFilter: MatchResolverFilter | null = null;

    public setNext(filter: MatchResolverFilter): MatchResolverFilter {
        this.nextFilter = filter;
        return filter;
    }

    public apply(input: FilterResult): FilterResult {
        const output = this.process(input);
        return this.passToNext(output);
    }

    protected abstract process(input: FilterResult): FilterResult;

    protected passToNext(input: FilterResult): FilterResult {
        if (this.nextFilter) {
            return this.nextFilter.apply(input);
        }

        return input;
    }
}