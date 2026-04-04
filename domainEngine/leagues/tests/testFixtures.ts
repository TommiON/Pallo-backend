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

const makeSequentialClubs = (startId: number, prefix: string, count: number): Club[] => {
    const clubs: Club[] = [];

    for (let i = 0; i < count; i++) {
        clubs.push(makeClub(startId + i, `${prefix} ${i + 1}`));
    }

    return clubs;
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
    topLeague.clubs = makeSequentialClubs(nextClubId, "L1S1 Club", clubsPerLeague);
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
                league.clubs = makeSequentialClubs(nextClubId, `L${divisionLevel}S${serialNumberOnDivisionLevel} Club`, clubsPerLeague);
                nextClubId += clubsPerLeague;

                currentLevelLeagues.push(league);
                allLeagues.push(league);
            }
        }

        levels.push(currentLevelLeagues);
    }

    return allLeagues;
};
