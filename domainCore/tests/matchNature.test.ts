const loadMatchNature = (matchGranularityMinutes: number, startMinute: number = 0) => {
    jest.resetModules();

    jest.doMock("../domainProperties", () => ({
        ...jest.requireActual("../domainProperties"),
        MATCH_GRANULARITY_MINUTES: matchGranularityMinutes
    }));

    const { default: MatchNature } = require("../MatchNature") as {
        default: typeof import("../MatchNature").default;
    };
    const { default: Club } = require("../Club") as {
        default: typeof import("../Club").default;
    };
    const { default: Match } = require("../Match") as {
        default: typeof import("../Match").default;
    };

    const mockMatch = new Match(new Club("Home Test Club"), new Club("Away Test Club"), 1);

    return {
        MatchNature,
        matchNature: MatchNature.createInitial(mockMatch, startMinute),
        intensityTimeStep: matchGranularityMinutes / 3,
        matchGranularityMinutes
    };
};

const expectMinuteToEqual = (actual: number, expected: number) => {
    expect(actual).toBeCloseTo(expected, 10);
};

const expectShareToEqual = (actual: number | undefined, expected: number) => {
    expect(actual).not.toBeUndefined();
    expect(actual as number).toBeCloseTo(expected, 10);
};

describe.each([10, 15, 20])("MatchNature with MATCH_GRANULARITY_MINUTES=%i", (matchGranularityMinutes) => {
    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        jest.dontMock("../domainProperties");
    });

    describe("Constructor", () => {
        it("should initialize with correct start and end minutes", () => {
            const startMinute = 0;
            const { matchNature } = loadMatchNature(matchGranularityMinutes, startMinute);

            expect(matchNature.startMinute).toBe(startMinute);
            expect(matchNature.endMinute).toBe(startMinute + matchGranularityMinutes);
        });

        it("should cap the period at halftime when endtime would cross 45 minutes", () => {
            const startMinute = 45 - matchGranularityMinutes;
            const { matchNature } = loadMatchNature(matchGranularityMinutes, startMinute);

            expect(matchNature.startMinute).toBe(startMinute);
            expect(matchNature.endMinute).toBe(45);
        });

        it("should cap the period at fulltime when endtime would cross 90 minutes", () => {
            const startMinute = 90 - matchGranularityMinutes;
            const { matchNature } = loadMatchNature(matchGranularityMinutes, startMinute);

            expect(matchNature.startMinute).toBe(startMinute);
            expect(matchNature.endMinute).toBe(90);
        });

        it("should create a new phase from the previous phase end minute and carry forward state", () => {
            const startMinute = 0;
            const { MatchNature, matchNature } = loadMatchNature(matchGranularityMinutes, startMinute);

            matchNature.pushForPossession("midfield", true);
            (matchNature as any)._balance.set("midfield", 0.35);

            const nextMatchNature = MatchNature.createFromPrevious(matchNature);

            expect(nextMatchNature.startMinute).toBe(matchNature.endMinute);
            expect(nextMatchNature.endMinute).toBe(Math.min(matchNature.endMinute + matchGranularityMinutes, 90));
            expect(nextMatchNature.balance).not.toBe(matchNature.balance);
            expect(nextMatchNature.homePossession).not.toBe(matchNature.homePossession);
            expectShareToEqual(nextMatchNature.homePossession.get("midfield"), 0.6);
            expectShareToEqual(nextMatchNature.balance.get("midfield"), 0.35);
        });

        it("should not share carried-forward maps by reference", () => {
            const { MatchNature, matchNature } = loadMatchNature(matchGranularityMinutes, 0);

            matchNature.pushForPossession("midfield", true);

            const nextMatchNature = MatchNature.createFromPrevious(matchNature);

            nextMatchNature.pushForPossession("midfield", true);

            expectShareToEqual(matchNature.homePossession.get("midfield"), 0.6);
            expectShareToEqual(nextMatchNature.homePossession.get("midfield"), 0.68);
        });
    });

    describe("intensityUp", () => {
        it("should reduce end time by one intensity step", () => {
            const startMinute = 0;
            const { matchNature, intensityTimeStep } = loadMatchNature(matchGranularityMinutes, startMinute);

            matchNature.intensityUp();

            expectMinuteToEqual(matchNature.endMinute, startMinute + matchGranularityMinutes - intensityTimeStep);
        });

        it("should not let end time get too close to start time", () => {
            const startMinute = 0;
            const { matchNature, intensityTimeStep } = loadMatchNature(matchGranularityMinutes, startMinute);

            matchNature.intensityUp();
            matchNature.intensityUp();

            expectMinuteToEqual(matchNature.endMinute, startMinute + intensityTimeStep);

            matchNature.intensityUp();

            expectMinuteToEqual(matchNature.endMinute, startMinute + intensityTimeStep);
        });
    });

    describe("intensityDown", () => {
        it("should increase end time by one intensity step", () => {
            const startMinute = 0;
            const { matchNature, intensityTimeStep } = loadMatchNature(matchGranularityMinutes, startMinute);

            matchNature.intensityUp();
            matchNature.intensityUp();
            matchNature.intensityDown();

            expectMinuteToEqual(matchNature.endMinute, startMinute + 2 * intensityTimeStep);
        });

        it("should not let end time get too far away from start time", () => {
            const startMinute = 0;
            const { matchNature } = loadMatchNature(matchGranularityMinutes, startMinute);

            matchNature.intensityDown();

            expect(matchNature.endMinute).toBe(startMinute + matchGranularityMinutes);
        });

        it("should cap at halftime when slowing down would cross 45 minutes", () => {
            const startMinute = 45 - matchGranularityMinutes;
            const { matchNature, intensityTimeStep } = loadMatchNature(matchGranularityMinutes, startMinute);

            matchNature.intensityUp();

            expectMinuteToEqual(matchNature.endMinute, 45 - intensityTimeStep);

            matchNature.intensityDown();

            expect(matchNature.endMinute).toBe(45);
        });

        it("should cap at fulltime when slowing down would cross 90 minutes", () => {
            const startMinute = 90 - matchGranularityMinutes;
            const { matchNature, intensityTimeStep } = loadMatchNature(matchGranularityMinutes, startMinute);

            matchNature.intensityUp();

            expectMinuteToEqual(matchNature.endMinute, 90 - intensityTimeStep);

            matchNature.intensityDown();

            expect(matchNature.endMinute).toBe(90);
        });
    });

    describe("pushForPossession", () => {
        it("should increase home possession in the selected area", () => {
            const { matchNature } = loadMatchNature(matchGranularityMinutes);

            matchNature.pushForPossession("midfield", true);

            expectShareToEqual(matchNature.homePossession.get("midfield"), 0.6);
        });

        it("should increase away possession by decreasing stored home possession in the selected area", () => {
            const { matchNature } = loadMatchNature(matchGranularityMinutes);

            matchNature.pushForPossession("midfield", false);

            expectShareToEqual(matchNature.homePossession.get("midfield"), 0.4);
        });

        it("should apply diminishing returns over repeated home pushes", () => {
            const { matchNature } = loadMatchNature(matchGranularityMinutes);

            matchNature.pushForPossession("midfield", true);
            matchNature.pushForPossession("midfield", true);

            expectShareToEqual(matchNature.homePossession.get("midfield"), 0.68);
        });

        it("should apply diminishing returns over repeated away pushes", () => {
            const { matchNature } = loadMatchNature(matchGranularityMinutes);

            matchNature.pushForPossession("midfield", false);
            matchNature.pushForPossession("midfield", false);

            expectShareToEqual(matchNature.homePossession.get("midfield"), 0.32);
        });

        it("should not affect other pitch areas", () => {
            const { matchNature } = loadMatchNature(matchGranularityMinutes);

            matchNature.pushForPossession("midfield", true);

            expectShareToEqual(matchNature.homePossession.get("midfield"), 0.6);
            expectShareToEqual(matchNature.homePossession.get("homeAttackLeft"), 0.5);
            expectShareToEqual(matchNature.homePossession.get("homeDefenceCentre"), 0.5);
        });

        it("should stop changing once the pushed side is already above the hard cap threshold", () => {
            const { matchNature } = loadMatchNature(matchGranularityMinutes);

            matchNature.pushForPossession("midfield", true);
            matchNature.pushForPossession("midfield", true);
            matchNature.pushForPossession("midfield", true);
            matchNature.pushForPossession("midfield", true);
            matchNature.pushForPossession("midfield", true);

            const cappedValue = matchNature.homePossession.get("midfield");

            expectShareToEqual(cappedValue, 0.83616);

            matchNature.pushForPossession("midfield", true);

            expectShareToEqual(matchNature.homePossession.get("midfield"), 0.83616);
        });
    });
});