import { MatchResolverFilter, MatchResolverFilterResult, } from "../MatchResolverFilter";

// just logs the current match state; input flows through unchanged
class LoggerFilter extends MatchResolverFilter {
    protected process(input: MatchResolverFilterResult): MatchResolverFilterResult {
        console.log(`MINUUTILLA ${input.currentMatchNature.startMinute} ALKANUT ja ${input.currentMatchNature.endMinute} PÄÄTTYNYT PELIVAIHE:`);
        console.log('Possession:', input.currentMatchNature.homePossession);
        console.log('Balance:', input.currentMatchNature.balance);

        const newEvents = input.matchEvents.filter(event => event.minute >= input.currentMatchNature.startMinute);
        if (newEvents.length > 0) {
            console.log('Uudet tapahtumat:', newEvents);
        }

        if (input.currentMatchNature.endMinute >= 90) {
            console.log('Lopulliset tapahtumat:', input.matchEvents);
        }

        return input;
    }
}

export default LoggerFilter;