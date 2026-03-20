import Match from "../Match";
import MatchEvent from "../MatchEvent";
//import { MatchResult } from "../Match";

describe('Match', () => {
    it('should dummyplay correctly', () => {
        // Given: a match with home and away clubs
        const homeClub = { id: 1, name: 'FC Koti' } as any;
        const awayClub = { id: 2, name: 'FC Vieras' } as any;
        const match = new Match(homeClub, awayClub, 1);
            
        // When: we dummyplay the match
        match.dummyPlay();

        // Then: the events should be populated and the result should match the events
        const result = match.getResult();
        const homeGoals = match.events.filter(e => e.type === 'goal' && e.initiator === 'home').length;
        const awayGoals = match.events.filter(e => e.type === 'goal' && e.initiator === 'away').length;

        expect(result.homeGoals).toEqual(homeGoals);
        expect(result.awayGoals).toEqual(awayGoals);
        expect(result.homeGoals).toBeGreaterThanOrEqual(0);
        expect(result.homeGoals).toBeLessThanOrEqual(3);
        expect(result.awayGoals).toBeGreaterThanOrEqual(0);
        expect(result.awayGoals).toBeLessThanOrEqual(3);
        }
    )
})