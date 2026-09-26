import MatchNature from "../../domainCore/MatchNature";
import MatchEvent from "../../domainCore/MatchEvent";
import Tactics from "../../domainCore/Tactics";

// Abstract base class for all match resolver filters

export type MatchResolverFilterResult = {
    homeTactics: Tactics;
    awayTactics: Tactics;
    currentMatchNature: MatchNature;
    previousMatchNatures: ReadonlyArray<MatchNature>;
    matchEvents: MatchEvent[];
}

export abstract class MatchResolverFilter {
    protected nextFilter: MatchResolverFilter | null = null;

    public setNext(filter: MatchResolverFilter): MatchResolverFilter {
        this.nextFilter = filter;
        return filter;
    }

    public apply(input: MatchResolverFilterResult): MatchResolverFilterResult {
        const output = this.process(input);
        return this.passToNext(output);
    }

    // filter-specific logic implemented here
    protected abstract process(input: MatchResolverFilterResult): MatchResolverFilterResult;

    protected passToNext(input: MatchResolverFilterResult): MatchResolverFilterResult {
        if (this.nextFilter) {
            return this.nextFilter.apply(input);
        }

        return input;
    }
}