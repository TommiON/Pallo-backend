import { resolveMatches } from "../resolveMatches";
import * as matchService from "../../dataAccess/matchService";
import * as matchEventService from "../../dataAccess/matchEventService";
import * as matchNatureService from "../../dataAccess/matchNatureService";
import * as standingService from "../../dataAccess/standingService";
import Match from "../../domainCore/Match";
import Club from "../../domainCore/Club";
import { resolveMatch } from "../../domainEngine/matches/MatchResolver";
import { updateStandingsAfterMatch } from "../../domainEngine/leagues/standingsManager";

jest.mock("../../domainEngine/matches/MatchResolver", () => ({
    resolveMatch: jest.fn(),
}));

jest.mock("../../domainEngine/leagues/standingsManager", () => ({
    updateStandingsAfterMatch: jest.fn(),
}));

describe("resolveMatches", () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("skips matches that are already finished before resolving them", async () => {
        const homeClub = new Club("Home");
        homeClub.id = 10;
        const awayClub = new Club("Away");
        awayClub.id = 20;

        const finishedMatch = new Match(homeClub, awayClub, 5);
        finishedMatch.id = 1;
        finishedMatch.finished = true;

        const activeMatch = new Match(homeClub, awayClub, 5);
        activeMatch.id = 2;

        jest.spyOn(matchService, "findMatchesBySeasonAndWeek").mockResolvedValue([finishedMatch, activeMatch]);
        jest.spyOn(matchEventService, "saveMatchEventsInBatch").mockResolvedValue(undefined);
        jest.spyOn(matchNatureService, "saveMatchNaturesInBatch").mockResolvedValue(undefined);
        jest.spyOn(matchService, "saveMatch").mockResolvedValue(activeMatch);
        jest.spyOn(standingService, "saveStanding").mockResolvedValue({} as any);
        jest.spyOn(matchService, "saveMatchesInBatch").mockResolvedValue(undefined);

        (resolveMatch as jest.Mock).mockReturnValue({
            phases: [],
            events: [],
        });
        (updateStandingsAfterMatch as jest.Mock).mockResolvedValue({
            homeStanding: { clubId: 10, leagueId: 1, week: 5 },
            awayStanding: { clubId: 20, leagueId: 1, week: 5 },
        });

        await resolveMatches(1, 5);

        expect(resolveMatch).toHaveBeenCalledTimes(1);
        expect(resolveMatch).toHaveBeenCalledWith(activeMatch);
        expect(matchEventService.saveMatchEventsInBatch).toHaveBeenCalledTimes(1);
        expect(matchNatureService.saveMatchNaturesInBatch).toHaveBeenCalledTimes(1);
        expect(matchService.saveMatch).toHaveBeenCalledTimes(1);
        expect(standingService.saveStanding).toHaveBeenCalledTimes(2);
    });
});
