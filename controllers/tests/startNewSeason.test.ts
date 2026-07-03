import Club from "../../domainCore/Club";
import League from "../../domainCore/League";
import { LEAGUE_NUMBER_OF_TEAMS } from "../../domainCore/domainProperties";
import { startNewSeason } from "../startNewSeason";
import * as leagueService from "../../dataAccess/leagueService";
import * as clubService from "../../dataAccess/clubService";
import * as matchService from "../../dataAccess/matchService";

jest.mock("../../dataAccess/matchService", () => ({
    saveMatchesInBatch: jest.fn()
}));

const createLeague = (season: number, divisionLevel: number, serialNumber: number, promotesTo: League | null = null): League => {
    return new League(season, divisionLevel, serialNumber, promotesTo);
};

const createClubReferences = (clubIds: number[]): Club[] => {
    return clubIds.map(clubId => {
        const club = new Club("");
        club.id = clubId;
        return club;
    });
};

describe("startNewSeason", () => {
    let findLeaguesBySeasonSpy: jest.SpyInstance;
    let persistSeasonTransitionSpy: jest.SpyInstance;
    let findNonAttachedUserClubsSpy: jest.SpyInstance;
    let saveMatchesInBatchMock: jest.Mock;

    beforeEach(() => {
        jest.restoreAllMocks();

        findLeaguesBySeasonSpy = jest.spyOn(leagueService, "findLeaguesBySeason");
        persistSeasonTransitionSpy = jest.spyOn(leagueService, "persistSeasonTransition");
        findNonAttachedUserClubsSpy = jest.spyOn(clubService, "findNonAttachedUserClubs");
        saveMatchesInBatchMock = matchService.saveMatchesInBatch as jest.Mock;

        persistSeasonTransitionSpy.mockResolvedValue([]);
        saveMatchesInBatchMock.mockResolvedValue(undefined);
    });

    it("loads previous season and waiting list with correct season parameters", async () => {
        findLeaguesBySeasonSpy.mockResolvedValue([]);
        findNonAttachedUserClubsSpy.mockResolvedValue([]);

        await startNewSeason(5);

        expect(findLeaguesBySeasonSpy).toHaveBeenCalledWith(4);
        expect(findNonAttachedUserClubsSpy).toHaveBeenCalledWith(4);
    });

    it("throws for first season when there are not enough clubs to form one league", async () => {
        findLeaguesBySeasonSpy.mockResolvedValue([]);
        findNonAttachedUserClubsSpy.mockResolvedValue([1, 2, 3]);

        await expect(startNewSeason(0)).rejects.toMatchObject({
            name: "NotEnoughClubsForSeasonStartError"
        });

        expect(persistSeasonTransitionSpy).not.toHaveBeenCalled();
        expect(findNonAttachedUserClubsSpy).toHaveBeenCalledWith(0);
    });

    it("persists empty transition when no previous leagues and not enough waiting clubs for non-first season", async () => {
        findLeaguesBySeasonSpy.mockResolvedValue([]);
        findNonAttachedUserClubsSpy.mockResolvedValue([1, 2, 3]);

        await startNewSeason(2);

        expect(persistSeasonTransitionSpy).toHaveBeenCalledTimes(1);
        expect(persistSeasonTransitionSpy).toHaveBeenCalledWith([], []);
    });

    it("creates initial league(s) via PyramidExpander when first season has enough waiting clubs", async () => {
        const waitingClubs = Array.from({ length: LEAGUE_NUMBER_OF_TEAMS }, (_, i) => i + 1);
        findLeaguesBySeasonSpy.mockResolvedValue([]);
        findNonAttachedUserClubsSpy.mockResolvedValue(waitingClubs);

        await startNewSeason(0);

        expect(persistSeasonTransitionSpy).toHaveBeenCalledTimes(1);

        const [previousSeasonLeaguesArg, newSeasonLeaguesArg] = persistSeasonTransitionSpy.mock.calls[0];
        expect(previousSeasonLeaguesArg).toEqual([]);
        expect(newSeasonLeaguesArg).toHaveLength(1);
        expect(newSeasonLeaguesArg[0].season).toBe(0);
        expect(newSeasonLeaguesArg[0].divisionLevel).toBe(0);
        expect(newSeasonLeaguesArg[0].serialNumberOnDivisionLevel).toBe(0);
        expect(newSeasonLeaguesArg[0].clubs).toHaveLength(LEAGUE_NUMBER_OF_TEAMS);
    });

    it("promotes/relegates previous leagues, updates season, marks previous as finished, and persists", async () => {
        const previousSeasonLeague = createLeague(3, 0, 0, null);
        previousSeasonLeague.id = 100;

        findLeaguesBySeasonSpy.mockResolvedValue([previousSeasonLeague]);
        findNonAttachedUserClubsSpy.mockResolvedValue([]);

        await startNewSeason(4);

        expect(persistSeasonTransitionSpy).toHaveBeenCalledTimes(1);
        const [previousSeasonLeaguesArg, newSeasonLeaguesArg] = persistSeasonTransitionSpy.mock.calls[0];

        expect(previousSeasonLeaguesArg).toHaveLength(1);
        expect(previousSeasonLeaguesArg[0]).toBe(previousSeasonLeague);
        expect(previousSeasonLeaguesArg[0].finished).toBe(true);

        expect(newSeasonLeaguesArg).toHaveLength(1);
        expect(newSeasonLeaguesArg[0]).not.toBe(previousSeasonLeague);
        expect(newSeasonLeaguesArg[0].season).toBe(4);
    });

    it("appends pyramid expansion on top of promoted/relegated leagues when waiting list has enough clubs", async () => {
        const previousSeasonLeague = createLeague(7, 0, 0, null);
        previousSeasonLeague.id = 700;

        const waitingClubs = Array.from({ length: LEAGUE_NUMBER_OF_TEAMS }, (_, i) => i + 50);

        findLeaguesBySeasonSpy.mockResolvedValue([previousSeasonLeague]);
        findNonAttachedUserClubsSpy.mockResolvedValue(waitingClubs);

        await startNewSeason(8);

        const [, newSeasonLeaguesArg] = persistSeasonTransitionSpy.mock.calls[0];

        expect(newSeasonLeaguesArg.length).toBeGreaterThan(1);
        expect(newSeasonLeaguesArg[0].season).toBe(8);

        const createdLeaguesWithClubs = newSeasonLeaguesArg.filter((league: League) => (league.clubs ?? []).length > 0);
        expect(createdLeaguesWithClubs).toHaveLength(1);
        expect(createdLeaguesWithClubs[0].clubs).toHaveLength(LEAGUE_NUMBER_OF_TEAMS);
    });

    it("propagates persistence errors", async () => {
        findLeaguesBySeasonSpy.mockResolvedValue([]);
        findNonAttachedUserClubsSpy.mockResolvedValue([]);
        persistSeasonTransitionSpy.mockRejectedValue(new Error("persist failed"));

        await expect(startNewSeason(3)).rejects.toThrow("persist failed");
    });

    it("preserves previous-season club memberships through the full season transition chain", async () => {
        const previousSeasonLeague = createLeague(4, 0, 0, null);
        previousSeasonLeague.id = 101;
        previousSeasonLeague.clubs = createClubReferences([11, 12, 13, 14]);

        findLeaguesBySeasonSpy.mockResolvedValue([previousSeasonLeague]);
        findNonAttachedUserClubsSpy.mockResolvedValue([]);

        await startNewSeason(5);

        expect(persistSeasonTransitionSpy).toHaveBeenCalledTimes(1);
        const [previousSeasonLeaguesArg, newSeasonLeaguesArg] = persistSeasonTransitionSpy.mock.calls[0];

        expect(previousSeasonLeaguesArg).toHaveLength(1);
        expect(previousSeasonLeaguesArg[0].clubs).toHaveLength(4);
        expect(previousSeasonLeaguesArg[0].clubs!.map((club: Club) => club.id)).toEqual([11, 12, 13, 14]);

        expect(newSeasonLeaguesArg).toHaveLength(1);
        expect(newSeasonLeaguesArg[0].clubs).toHaveLength(4);
        expect(newSeasonLeaguesArg[0].clubs!.map((club: Club) => club.id)).toEqual([11, 12, 13, 14]);
    });
});