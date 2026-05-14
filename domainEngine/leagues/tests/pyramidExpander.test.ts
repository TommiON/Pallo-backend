import { describe, it, expect } from "@jest/globals";
import { isCapacityLeftOnDivisionLevel } from "../pyramidExpander";
import League from "../../../domainModel/league/League";
import { LEAGUE_NUMBER_OF_TEAMS, LEAGUE_SPAN_FACTOR } from "../../../domainProperties/domainProperties";

function makeLeaguesOnLevel(level: number, count: number): League[] {
    return Array.from({ length: count }, (_, i) => new League(2026, level, i, null));
}

describe("isCapacityLeftOnDivisionLevel", () => {
    it("returns true when division is empty", () => {
        expect(isCapacityLeftOnDivisionLevel([], 0)).toBe(true);
    });

    it("returns true when not full (top division)", () => {
        const leagues = makeLeaguesOnLevel(0, LEAGUE_NUMBER_OF_TEAMS - 1);
        expect(isCapacityLeftOnDivisionLevel(leagues, 0)).toBe(true);
    });

    it("returns false when full (top division)", () => {
        const leagues = makeLeaguesOnLevel(0, LEAGUE_NUMBER_OF_TEAMS);
        expect(isCapacityLeftOnDivisionLevel(leagues, 0)).toBe(false);
    });

    it("returns true when not full (lower division)", () => {
        const level = 2;
        const capacity = Math.pow(LEAGUE_SPAN_FACTOR, level) * LEAGUE_NUMBER_OF_TEAMS;
        const leagues = makeLeaguesOnLevel(level, capacity - 1);
        expect(isCapacityLeftOnDivisionLevel(leagues, level)).toBe(true);
    });

    it("returns false when full (lower division)", () => {
        const level = 2;
        const capacity = Math.pow(LEAGUE_SPAN_FACTOR, level) * LEAGUE_NUMBER_OF_TEAMS;
        const leagues = makeLeaguesOnLevel(level, capacity);
        expect(isCapacityLeftOnDivisionLevel(leagues, level)).toBe(false);
    });
});
