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
        matchNature: new MatchNature(mockMatch, startMinute),
        intensityTimeStep: matchGranularityMinutes / 3,
        matchGranularityMinutes
    };
};

describe.each([15, 30])("MatchNature with MATCH_GRANULARITY_MINUTES=%i", (matchGranularityMinutes) => {
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
    });

    describe("intensityUp", () => {
        it("should reduce end time by one intensity step", () => {
            const startMinute = 0;
            const { matchNature, intensityTimeStep } = loadMatchNature(matchGranularityMinutes, startMinute);

            matchNature.intensityUp();

            expect(matchNature.endMinute).toBe(startMinute + matchGranularityMinutes - intensityTimeStep);
        });

        it("should not let end time get too close to start time", () => {
            const startMinute = 0;
            const { matchNature, intensityTimeStep } = loadMatchNature(matchGranularityMinutes, startMinute);

            matchNature.intensityUp();
            matchNature.intensityUp();

            expect(matchNature.endMinute).toBe(startMinute + intensityTimeStep);

            matchNature.intensityUp();

            expect(matchNature.endMinute).toBe(startMinute + intensityTimeStep);
        });
    });

    describe("intensityDown", () => {
        it("should increase end time by one intensity step", () => {
            const startMinute = 0;
            const { matchNature, intensityTimeStep } = loadMatchNature(matchGranularityMinutes, startMinute);

            matchNature.intensityUp();
            matchNature.intensityUp();
            matchNature.intensityDown();

            expect(matchNature.endMinute).toBe(startMinute + 2 * intensityTimeStep);
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

            expect(matchNature.endMinute).toBe(45 - intensityTimeStep);

            matchNature.intensityDown();

            expect(matchNature.endMinute).toBe(45);
        });

        it("should cap at fulltime when slowing down would cross 90 minutes", () => {
            const startMinute = 90 - matchGranularityMinutes;
            const { matchNature, intensityTimeStep } = loadMatchNature(matchGranularityMinutes, startMinute);

            matchNature.intensityUp();

            expect(matchNature.endMinute).toBe(90 - intensityTimeStep);

            matchNature.intensityDown();

            expect(matchNature.endMinute).toBe(90);
        });
    });
});