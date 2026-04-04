import Club from "../../../domainModel/club/Club";
import League from "../../../domainModel/league/League";

type PyramidFixtureParams = {
    numberOfLevels: number;
    clubsPerLeague: number;
    spanFactor: number;
    symmetric: boolean;
};

const makeClub = (id: number, name: string): Club => {
    const club = new Club();
    club.id = id;
    club.name = name;
    club.established = new Date("2020-01-01");
    club.zombie = false;
    return club;
};

const makeSequentialClubs = (startId: number, count: number, nameFactory: (position: number) => string): Club[] => {
    const clubs: Club[] = [];

    for (let i = 0; i < count; i++) {
        const position = i + 1;
        clubs.push(makeClub(startId + i, nameFactory(position)));
    }

    return clubs;
};

const makeFixtureClubName = (divisionLevel: number, serialNumberOnDivisionLevel: number, position: number): string => {
    return `L${divisionLevel}S${serialNumberOnDivisionLevel}P${position}`;
};

/**
 * Builds a fresh league pyramid fixture according to the provided parameters.
 * If symmetric is false, exactly one child league is omitted on the lowest level.
 */
export const createLeaguePyramidFixture = ({
    numberOfLevels,
    clubsPerLeague,
    spanFactor,
    symmetric,
}: PyramidFixtureParams): League[] => {
    if (numberOfLevels < 1) {
        throw new Error("numberOfLevels must be at least 1");
    }

    if (clubsPerLeague < 1) {
        throw new Error("clubsPerLeague must be at least 1");
    }

    if (spanFactor < 1) {
        throw new Error("spanFactor must be at least 1");
    }

    const levels: League[][] = [];
    const allLeagues: League[] = [];

    let nextLeagueId = 1;
    let nextClubId = 1;

    const topLeague = new League(1, 1, 1, null);
    topLeague.id = nextLeagueId++;
    topLeague.clubs = makeSequentialClubs(
        nextClubId,
        clubsPerLeague,
        (position) => makeFixtureClubName(topLeague.divisionLevel, topLeague.serialNumberOnDivisionLevel, position),
    );
    nextClubId += clubsPerLeague;

    levels.push([topLeague]);
    allLeagues.push(topLeague);

    for (let divisionLevel = 2; divisionLevel <= numberOfLevels; divisionLevel++) {
        const previousLevelLeagues = levels[divisionLevel - 2];
        const currentLevelLeagues: League[] = [];
        let isMissingChildApplied = false;

        for (let parentIndex = 0; parentIndex < previousLevelLeagues.length; parentIndex++) {
            const parentLeague = previousLevelLeagues[parentIndex];

            for (let childIndex = 0; childIndex < spanFactor; childIndex++) {
                const isLowestLevel = divisionLevel === numberOfLevels;
                const isLastParent = parentIndex === previousLevelLeagues.length - 1;
                const isLastChild = childIndex === spanFactor - 1;
                const shouldSkipChild = !symmetric && isLowestLevel && isLastParent && isLastChild && !isMissingChildApplied;

                if (shouldSkipChild) {
                    isMissingChildApplied = true;
                    continue;
                }

                const serialNumberOnDivisionLevel = currentLevelLeagues.length + 1;
                const league = new League(1, divisionLevel, serialNumberOnDivisionLevel, parentLeague);
                league.id = nextLeagueId++;
                league.promotesToId = parentLeague.id;
                league.clubs = makeSequentialClubs(
                    nextClubId,
                    clubsPerLeague,
                    (position) => makeFixtureClubName(divisionLevel, serialNumberOnDivisionLevel, position),
                );
                nextClubId += clubsPerLeague;

                currentLevelLeagues.push(league);
                allLeagues.push(league);
            }
        }

        levels.push(currentLevelLeagues);
    }

    return allLeagues;
};

export const findLeagueInFixture = (leagues: League[], divisionLevel: number, serialNumberOnDivisionLevel: number): League => {
    const league = leagues.find((item) => item.divisionLevel === divisionLevel && item.serialNumberOnDivisionLevel === serialNumberOnDivisionLevel);

    if (!league) {
        throw new Error(`League not found for divisionLevel=${divisionLevel}, serialNumberOnDivisionLevel=${serialNumberOnDivisionLevel}`);
    }

    return league;
};

export const topClubNames = (league: League, count: number): string[] => {
    if (!league.clubs) {
        throw new Error("League has no clubs for topClubNames");
    }

    return league.clubs.slice(0, count).map((club) => club.name);
};

export const bottomClubNames = (league: League, count: number): string[] => {
    if (!league.clubs) {
        throw new Error("League has no clubs for bottomClubNames");
    }

    return league.clubs.slice(-count).map((club) => club.name);
};
