import { createLeaguePyramidFixture, findLeagueInFixture } from "./testFixtures";
import { promoteAndRelegate } from "../promotorRelegator";
import { LEAGUE_PROMOTED_FROM_TOP } from "../../../domainProperties/domainProperties";

describe("PromoRelegator", () => {
    it("swaps top clubs from two child leagues with bottom clubs of parent league", () => {
        const leagues = createLeaguePyramidFixture({
            numberOfLevels: 2,
            clubsPerLeague: 8,
            spanFactor: 2,
            symmetric: true,
        });

        const oldTop = findLeagueInFixture(leagues, 1, 1);
        const oldChildA = findLeagueInFixture(leagues, 2, 1);
        const oldChildB = findLeagueInFixture(leagues, 2, 2);

        const oldTopNames = oldTop.clubs!.map((club) => club.name);
        const oldChildANames = oldChildA.clubs!.map((club) => club.name);
        const oldChildBNames = oldChildB.clubs!.map((club) => club.name);

        const result = promoteAndRelegate(leagues);

        const newTop = findLeagueInFixture(result, 1, 1);
        const newChildA = findLeagueInFixture(result, 2, 1);
        const newChildB = findLeagueInFixture(result, 2, 2);

        const promotedFromA = oldChildANames.slice(0, LEAGUE_PROMOTED_FROM_TOP);
        const promotedFromB = oldChildBNames.slice(0, LEAGUE_PROMOTED_FROM_TOP);
        const relegatedFromTop = oldTopNames.slice(-(LEAGUE_PROMOTED_FROM_TOP * 2));

        expect(newTop.clubs!.map((club) => club.name)).toEqual([
            ...oldTopNames.slice(0, oldTopNames.length - LEAGUE_PROMOTED_FROM_TOP * 2),
            ...promotedFromA,
            ...promotedFromB,
        ]);

        expect(newChildA.clubs!.map((club) => club.name)).toEqual([
            ...oldChildANames.slice(LEAGUE_PROMOTED_FROM_TOP),
            ...relegatedFromTop.slice(0, LEAGUE_PROMOTED_FROM_TOP),
        ]);

        expect(newChildB.clubs!.map((club) => club.name)).toEqual([
            ...oldChildBNames.slice(LEAGUE_PROMOTED_FROM_TOP),
            ...relegatedFromTop.slice(LEAGUE_PROMOTED_FROM_TOP),
        ]);
    });

    it("handles asymmetric lowest level where one parent has fewer child leagues", () => {
        const leagues = createLeaguePyramidFixture({
            numberOfLevels: 3,
            clubsPerLeague: 8,
            spanFactor: 2,
            symmetric: false,
        });

        const oldMidB = findLeagueInFixture(leagues, 2, 2);
        const oldBottomB1 = findLeagueInFixture(leagues, 3, 3);

        const oldMidBNames = oldMidB.clubs!.map((club) => club.name);
        const oldBottomB1Names = oldBottomB1.clubs!.map((club) => club.name);

        const result = promoteAndRelegate(leagues);

        const newMidB = findLeagueInFixture(result, 2, 2);
        const newBottomB1 = findLeagueInFixture(result, 3, 3);

        // Lowest-to-top traversal means mid league first exchanges with its child,
        // then participates in promotion/relegation with the top league.
        expect(newMidB.clubs!.map((club) => club.name)).toEqual([
            ...oldMidBNames.slice(LEAGUE_PROMOTED_FROM_TOP, oldMidBNames.length - LEAGUE_PROMOTED_FROM_TOP),
            ...oldBottomB1Names.slice(0, LEAGUE_PROMOTED_FROM_TOP),
            "L1S1P7",
            "L1S1P8",
        ]);

        expect(newBottomB1.clubs!.map((club) => club.name)).toEqual([
            ...oldBottomB1Names.slice(LEAGUE_PROMOTED_FROM_TOP),
            ...oldMidBNames.slice(oldMidBNames.length - LEAGUE_PROMOTED_FROM_TOP),
        ]);

        expect(result).toHaveLength(leagues.length);
    });

    it("does not mutate original league arrays", () => {
        const leagues = createLeaguePyramidFixture({
            numberOfLevels: 2,
            clubsPerLeague: 8,
            spanFactor: 2,
            symmetric: true,
        });

        const originalTop = findLeagueInFixture(leagues, 1, 1);
        const originalTopNames = [...originalTop.clubs!.map((club) => club.name)];

        promoteAndRelegate(leagues);

        expect(findLeagueInFixture(leagues, 1, 1).clubs!.map((club) => club.name)).toEqual(originalTopNames);
    });

    it("returns leagues in the same order as the input", () => {
        const leagues = createLeaguePyramidFixture({
            numberOfLevels: 3,
            clubsPerLeague: 8,
            spanFactor: 2,
            symmetric: true,
        });

        const inputIds = leagues.map((league) => league.id);
        const result = promoteAndRelegate(leagues);

        expect(result.map((league) => league.id)).toEqual(inputIds);
    });

    it("supports overriding promoted count (top 3 up from each child, bottom 6 down from top)", () => {
        const promotedFromTop = 3;

        const leagues = createLeaguePyramidFixture({
            numberOfLevels: 2,
            clubsPerLeague: 10,
            spanFactor: 2,
            symmetric: true,
        });

        const oldTop = findLeagueInFixture(leagues, 1, 1);
        const oldChildA = findLeagueInFixture(leagues, 2, 1);
        const oldChildB = findLeagueInFixture(leagues, 2, 2);

        const oldTopNames = oldTop.clubs!.map((club) => club.name);
        const oldChildANames = oldChildA.clubs!.map((club) => club.name);
        const oldChildBNames = oldChildB.clubs!.map((club) => club.name);

        const result = promoteAndRelegate(leagues, promotedFromTop);

        const newTop = findLeagueInFixture(result, 1, 1);
        const newChildA = findLeagueInFixture(result, 2, 1);
        const newChildB = findLeagueInFixture(result, 2, 2);

        const relegatedFromTop = oldTopNames.slice(-6);

        expect(newTop.clubs!.map((club) => club.name)).toEqual([
            ...oldTopNames.slice(0, oldTopNames.length - 6),
            ...oldChildANames.slice(0, promotedFromTop),
            ...oldChildBNames.slice(0, promotedFromTop),
        ]);

        expect(newChildA.clubs!.map((club) => club.name)).toEqual([
            ...oldChildANames.slice(promotedFromTop),
            ...relegatedFromTop.slice(0, promotedFromTop),
        ]);

        expect(newChildB.clubs!.map((club) => club.name)).toEqual([
            ...oldChildBNames.slice(promotedFromTop),
            ...relegatedFromTop.slice(promotedFromTop),
        ]);

        expect(newTop.clubs).toHaveLength(10);
        expect(newChildA.clubs).toHaveLength(10);
        expect(newChildB.clubs).toHaveLength(10);
    });
});