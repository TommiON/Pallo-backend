import Club from "../../domainCore/Club";
import League from "../../domainCore/League";
import Standing from "../../domainCore/Standing";
import {
    createStandingService,
    findStandingByLeagueIdAndClubId,
    findStandingsByLeagueIdAndWeek,
    saveStanding
} from "../standingService";

describe("standingService", () => {
    const createStandingFixture = (leagueId: number, clubId: number, week: number): Standing => {
        const standing = new Standing();

        const league = new League(1, 0, 0, null);
        league.id = leagueId;

        const club = new Club(`Club ${clubId}`);
        club.id = clubId;

        standing.league = league;
        standing.club = club;
        standing.week = week;
        standing.points = 10;
        standing.wins = 3;
        standing.draws = 1;
        standing.losses = 0;
        standing.goalsFor = 7;
        standing.goalsAgainst = 2;

        return standing;
    };

    describe("delegation", () => {
        it("delegates saveStanding to standingStore.save", async () => {
            const standing = createStandingFixture(100, 10, 3);
            const standingStore = {
                save: jest.fn().mockResolvedValue(standing),
                findByLeagueIdAndWeek: jest.fn(),
                findByLeagueIdAndClubId: jest.fn()
            };

            const service = createStandingService({ standingStore });
            const result = await service.saveStanding(standing);

            expect(standingStore.save).toHaveBeenCalledWith(standing);
            expect(result).toBe(standing);
        });

        it("delegates findStandingsByLeagueIdAndWeek to standingStore.findByLeagueIdAndWeek", async () => {
            const standings = [
                createStandingFixture(100, 10, 3),
                createStandingFixture(100, 11, 3)
            ];
            const standingStore = {
                save: jest.fn(),
                findByLeagueIdAndWeek: jest.fn().mockResolvedValue(standings),
                findByLeagueIdAndClubId: jest.fn()
            };

            const service = createStandingService({ standingStore });
            const result = await service.findStandingsByLeagueIdAndWeek(100, 3);

            expect(standingStore.findByLeagueIdAndWeek).toHaveBeenCalledWith(100, 3);
            expect(result).toBe(standings);
        });

        it("delegates findStandingByLeagueIdAndClubId to standingStore.findByLeagueIdAndClubId", async () => {
            const standing = createStandingFixture(100, 10, 3);
            const standingStore = {
                save: jest.fn(),
                findByLeagueIdAndWeek: jest.fn(),
                findByLeagueIdAndClubId: jest.fn().mockResolvedValue(standing)
            };

            const service = createStandingService({ standingStore });
            const result = await service.findStandingByLeagueIdAndClubId(100, 10);

            expect(standingStore.findByLeagueIdAndClubId).toHaveBeenCalledWith(100, 10);
            expect(result).toBe(standing);
        });
    });

    describe("error conditions", () => {
        it("propagates errors from standingStore.save", async () => {
            const standing = createStandingFixture(100, 10, 3);
            const standingStore = {
                save: jest.fn().mockRejectedValue(new Error("save failed")),
                findByLeagueIdAndWeek: jest.fn(),
                findByLeagueIdAndClubId: jest.fn()
            };

            const service = createStandingService({ standingStore });

            await expect(service.saveStanding(standing)).rejects.toThrow("save failed");
            expect(standingStore.save).toHaveBeenCalledWith(standing);
        });

        it("propagates errors from standings query methods", async () => {
            const standingStore = {
                save: jest.fn(),
                findByLeagueIdAndWeek: jest.fn().mockRejectedValue(new Error("find by week failed")),
                findByLeagueIdAndClubId: jest.fn().mockRejectedValue(new Error("find by club failed"))
            };

            const service = createStandingService({ standingStore });

            await expect(service.findStandingsByLeagueIdAndWeek(100, 3)).rejects.toThrow("find by week failed");
            await expect(service.findStandingByLeagueIdAndClubId(100, 10)).rejects.toThrow("find by club failed");
        });
    });

    describe("configuration guard", () => {
        it("throws when saveStanding is called before configureStandingService", async () => {
            await expect(saveStanding(createStandingFixture(100, 10, 3))).rejects.toThrow("Standing service not configured");
        });

        it("throws when query functions are called before configureStandingService", async () => {
            await expect(findStandingsByLeagueIdAndWeek(100, 3)).rejects.toThrow("Standing service not configured");
            await expect(findStandingByLeagueIdAndClubId(100, 10)).rejects.toThrow("Standing service not configured");
        });
    });
});
