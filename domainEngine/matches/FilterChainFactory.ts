import { MatchResolverFilter } from "./MatchResolverFilter";

import DummyIntensityFilter from "./dummyFilters/DummyIntensityFilter";
import DummyPossessionFilter from "./dummyFilters/DummyPossessionFilter";
import DummyEventFilter from "./dummyFilters/DummyEventFilter";
import LoggerFilter from "./filters/LoggerFilter";

// The filter chain is composed here

const buildDummyFilterChain = (): MatchResolverFilter[] => {
    const filters: MatchResolverFilter[] = [];

    filters.push(new DummyIntensityFilter());
    filters.push(new DummyPossessionFilter());
    filters.push(new DummyEventFilter());
    filters.push(new LoggerFilter());
    
    linkFilterChain(filters);
    
    return filters;
}

const linkFilterChain = (filters: MatchResolverFilter[]): void => {
    for (let i = 0; i < filters.length - 1; i++) {
        filters[i].setNext(filters[i + 1]);
    }
}

export const dummyFilterChain = buildDummyFilterChain();
