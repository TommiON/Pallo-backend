import { MATCH_GRANULARITY_MINUTES } from "../domainProperties";
import MatchNature from "../MatchNature";
import Club from "../Club";
import Match from "../Match";

const mockMatch = new Match(new Club("Home Test Club"), new Club("Away Test Club"), 1);


describe("MatchNature", () => {
    describe("Constructor", () => {
        it("should initialize with correct start and end minutes", () => {
            const startMinute = 0;
            const matchNature = new MatchNature(mockMatch, startMinute);

            expect(matchNature.startMinute).toBe(startMinute);
            expect(matchNature.endMinute).toBe(startMinute + MATCH_GRANULARITY_MINUTES);
        });

        it("should cap the period at halftime when endtime would cross 45 minutes", () => {
            const startMinute = 45 - MATCH_GRANULARITY_MINUTES;
            const matchNature = new MatchNature(mockMatch, startMinute);

            expect(matchNature.startMinute).toBe(startMinute);
            expect(matchNature.endMinute).toBe(45);
        });

        it("should cap the period at fulltime when endtime would cross 90 minutes", () => {
            const startMinute = 90 - MATCH_GRANULARITY_MINUTES;
            const matchNature = new MatchNature(mockMatch, startMinute);

            expect(matchNature.startMinute).toBe(startMinute);
            expect(matchNature.endMinute).toBe(90);
        });
    });
    
});