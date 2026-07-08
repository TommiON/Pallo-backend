import Club from "../../../domainCore/Club";
import League from "../../../domainCore/League";
import Match from "../../../domainCore/Match";
import MatchEvent from "../../../domainCore/MatchEvent";
import Standing from "../../../domainCore/Standing";
import { findStandingByLeagueIdAndClubIdAndWeek } from "../../../dataAccess/standingService";
import { updateStandingsAfterMatch, createClubStandingComparator } from "../standingsManager";

jest.mock("../../../dataAccess/standingService", () => ({
    findStandingByLeagueIdAndClubIdAndWeek: jest.fn()
}));

const findStandingByLeagueIdAndClubIdAndWeekMock = findStandingByLeagueIdAndClubIdAndWeek as jest.MockedFunction<typeof findStandingByLeagueIdAndClubIdAndWeek>;

const createClub = (id: number, name: string): Club => {
    const club = new Club(name);
    club.id = id;
    return club;
};

const createLeague = (id: number): League => {
    const league = new League(1, 0, 0, null);
    league.id = id;
    return league;
};

const createStanding = (
    leagueId: number,
    clubId: number,
    week: number,
    points: number,
    wins: number,
    draws: number,
    losses: number,
    goalsFor: number,
    goalsAgainst: number
): Standing => {
    const standing = new Standing();
    standing.league = createLeague(leagueId);
    standing.club = createClub(clubId, `Club ${clubId}`);
    standing.week = week;
    standing.points = points;
    standing.wins = wins;
    standing.draws = draws;
    standing.losses = losses;
    standing.goalsFor = goalsFor;
    standing.goalsAgainst = goalsAgainst;
    return standing;
};

const mockFindStandingLookup = () => {
    const standingsByKey = new Map<string, Standing>();

    findStandingByLeagueIdAndClubIdAndWeekMock.mockImplementation(async (leagueId, clubId, week) => {
        return standingsByKey.get(`${leagueId}:${clubId}:${week}`) ?? null;
    });

    return (
        leagueId: number,
        clubId: number,
        week: number,
        points: number,
        wins: number,
        draws: number,
        losses: number,
        goalsFor: number,
        goalsAgainst: number
    ): Standing => {
        const standing = createStanding(
            leagueId,
            clubId,
            week,
            points,
            wins,
            draws,
            losses,
            goalsFor,
            goalsAgainst
        );

        standingsByKey.set(`${leagueId}:${clubId}:${week}`, standing);
        return standing;
    };
};

const createFinishedMatch = (homeGoals: number, awayGoals: number): Match => {
    const league = createLeague(99);
    const homeClub = createClub(1, "Home Club");
    const awayClub = createClub(2, "Away Club");
    const match = new Match(homeClub, awayClub, 3, league);

    for (let index = 0; index < homeGoals; index += 1) {
        match.events.push(new MatchEvent("goal", index + 1, "home"));
    }

    for (let index = 0; index < awayGoals; index += 1) {
        match.events.push(new MatchEvent("goal", homeGoals + index + 1, "away"));
    }

    return match;
};

describe("standingsManager", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("creates first-week standings from zero when no previous standings exist", async () => {
        findStandingByLeagueIdAndClubIdAndWeekMock.mockResolvedValue(null);
        const match = createFinishedMatch(2, 1);

        const { homeStanding, awayStanding } = await updateStandingsAfterMatch(match);

        expect(homeStanding.points).toBe(3);
        expect(homeStanding.wins).toBe(1);
        expect(homeStanding.draws).toBe(0);
        expect(homeStanding.losses).toBe(0);
        expect(homeStanding.goalsFor).toBe(2);
        expect(homeStanding.goalsAgainst).toBe(1);

        expect(awayStanding.points).toBe(0);
        expect(awayStanding.wins).toBe(0);
        expect(awayStanding.draws).toBe(0);
        expect(awayStanding.losses).toBe(1);
        expect(awayStanding.goalsFor).toBe(1);
        expect(awayStanding.goalsAgainst).toBe(2);
    });

    it("builds new standings from mocked previous-week totals", async () => {
        const addMockStanding = mockFindStandingLookup();
        const match = createFinishedMatch(1, 1);

        addMockStanding(99, 1, 2, 7, 2, 1, 0, 5, 2);
        addMockStanding(99, 2, 2, 4, 1, 1, 1, 3, 4);

        const { homeStanding, awayStanding } = await updateStandingsAfterMatch(match);

        expect(findStandingByLeagueIdAndClubIdAndWeekMock).toHaveBeenCalledWith(99, 1, 2);
        expect(findStandingByLeagueIdAndClubIdAndWeekMock).toHaveBeenCalledWith(99, 2, 2);

        expect(homeStanding.points).toBe(8);
        expect(homeStanding.wins).toBe(2);
        expect(homeStanding.draws).toBe(2);
        expect(homeStanding.losses).toBe(0);
        expect(homeStanding.goalsFor).toBe(6);
        expect(homeStanding.goalsAgainst).toBe(3);

        expect(awayStanding.points).toBe(5);
        expect(awayStanding.wins).toBe(1);
        expect(awayStanding.draws).toBe(2);
        expect(awayStanding.losses).toBe(1);
        expect(awayStanding.goalsFor).toBe(4);
        expect(awayStanding.goalsAgainst).toBe(5);
    });

    it("sorts correctly by point difference", async () => {
        const standingA = new Standing();
        standingA.league = createLeague(1);
        standingA.club = createClub(1, "Club A");
        standingA.week = 1;
        standingA.points = 11;
        standingA.goalsFor = 8;
        standingA.goalsAgainst = 5;

        const standingB = new Standing();
        standingB.league = createLeague(1);
        standingB.club = createClub(2, "Club B");
        standingB.week = 1;
        standingB.points = 12;
        standingB.goalsFor = 10;
        standingB.goalsAgainst = 9;

        const standingC = new Standing();
        standingC.league = createLeague(1);
        standingC.club = createClub(3, "Club C");
        standingC.week = 1;
        standingC.points = 10;
        standingC.goalsFor = 10;
        standingC.goalsAgainst = 9;

        const comparator = createClubStandingComparator([standingA, standingB, standingC]);
        const comparisonResult = [standingA, standingB, standingC].sort(await comparator);

        expect(comparisonResult[0]).toBe(standingB);
        expect(comparisonResult[1]).toBe(standingA);
        expect(comparisonResult[2]).toBe(standingC);
    });

    it("sorts correctly by goal difference", async () => {
        const standingA = new Standing();
        standingA.league = createLeague(1);
        standingA.club = createClub(1, "Club A");
        standingA.week = 1;
        standingA.points = 11;
        standingA.goalsFor = 8;
        standingA.goalsAgainst = 5;

        const standingB = new Standing();
        standingB.league = createLeague(1);
        standingB.club = createClub(2, "Club B");
        standingB.week = 1;
        standingB.points = 11;
        standingB.goalsFor = 10;
        standingB.goalsAgainst = 3;

        const standingC = new Standing();
        standingC.league = createLeague(1);
        standingC.club = createClub(3, "Club C");
        standingC.week = 1;
        standingC.points = 12;
        standingC.goalsFor = 10;
        standingC.goalsAgainst = 9;

        const comparator = createClubStandingComparator([standingA, standingB, standingC]);
        const comparisonResult = [standingA, standingB, standingC].sort(await comparator);

        expect(comparisonResult[0]).toBe(standingC);
        expect(comparisonResult[1]).toBe(standingB);
        expect(comparisonResult[2]).toBe(standingA);
    });

});
