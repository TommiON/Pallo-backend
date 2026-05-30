import League from "../../../domainCore/league/League";
import { expandPyramid } from "../pyramidExpander";
import { LEAGUE_NUMBER_OF_TEAMS } from "../../../domainProperties/domainProperties";

const createWaitingClubs = (numberOfFullLeagues: number, surplus: number = 0): number[] => {
    const total = (numberOfFullLeagues * LEAGUE_NUMBER_OF_TEAMS) + surplus;
    return Array.from({ length: total }, (_, i) => i + 1);
}

const surplus = (desired: number): number => {
    return Math.min(desired, LEAGUE_NUMBER_OF_TEAMS - 1);
}

const assertSurplusClubsAreUnplaced = (waitingClubs: number[], fullLeaguesUsed: number, result: any[]): void => {
    const placedClubIds = result.flatMap(l => (l.clubs ?? []).map((c: any) => c.id));
    const surplusClubIds = waitingClubs.slice(fullLeaguesUsed * LEAGUE_NUMBER_OF_TEAMS);
    surplusClubIds.forEach(id => expect(placedClubIds).not.toContain(id));
}

const assertPlacedClubsAreUnique = (result: any[]): void => {
    const placedClubIds = result.flatMap(l => (l.clubs ?? []).map((c: any) => c.id));
    const uniquePlacedClubIds = new Set(placedClubIds);

    expect(uniquePlacedClubIds.size).toBe(placedClubIds.length);
}

const getPlacedClubIds = (result: League[]): number[] => {
    return result.flatMap(league => (league.clubs ?? []).map((club: any) => club.id));
}

const createPreExistingTopLeague = (season: number): League => {
    return new League(season, 0, 0, null);
}

const getLeaguesOnLevel = (leagues: League[], divisionLevel: number): League[] => {
    return leagues
        .filter(l => l.divisionLevel === divisionLevel)
        .sort((a, b) => a.serialNumberOnDivisionLevel - b.serialNumberOnDivisionLevel);
}

const expandPyramidWithSpan = (
    leagues: League[],
    clubsOnWaitingList: number[],
    season: number,
    leagueSpanFactor: number,
): League[] => {
    return expandPyramid(leagues, clubsOnWaitingList, season, leagueSpanFactor);
}

const createPreExistingFourLevelPyramidWithThreeLowestLeagues = (season: number): League[] => {
    const root = new League(season, 0, 0, null);

    const level1_0 = new League(season, 1, 0, root);
    const level1_1 = new League(season, 1, 1, root);

    const level2_0 = new League(season, 2, 0, level1_0);
    const level2_1 = new League(season, 2, 1, level1_0);
    const level2_2 = new League(season, 2, 2, level1_1);
    const level2_3 = new League(season, 2, 3, level1_1);

    // Lowest existing level (level 3) has only three leagues.
    const level3_0 = new League(season, 3, 0, level2_0);
    const level3_1 = new League(season, 3, 1, level2_0);
    const level3_2 = new League(season, 3, 2, level2_1);

    return [
        root,
        level1_0, level1_1,
        level2_0, level2_1, level2_2, level2_3,
        level3_0, level3_1, level3_2
    ];
}

const createPreExistingFourLevelPyramidWithThreeLowestLeaguesAndCustomSpan = (season: number, spanFactor: number): League[] => {
    const root = new League(season, 0, 0, null);
    const levelBuckets: League[][] = [[root]];

    for (let divisionLevel = 1; divisionLevel <= 2; divisionLevel++) {
        const leagueCountOnLevel = Math.pow(spanFactor, divisionLevel);
        const parentLevel = levelBuckets[divisionLevel - 1];
        const currentLevel: League[] = [];

        for (let serial = 0; serial < leagueCountOnLevel; serial++) {
            const parent = parentLevel[Math.floor(serial / spanFactor)];
            currentLevel.push(new League(season, divisionLevel, serial, parent));
        }

        levelBuckets.push(currentLevel);
    }

    const lowestLevelParents = levelBuckets[2];
    const lowestLevel: League[] = [];
    for (let serial = 0; serial < 3; serial++) {
        const parent = lowestLevelParents[Math.floor(serial / spanFactor)];
        lowestLevel.push(new League(season, 3, serial, parent));
    }

    return [root, ...levelBuckets[1], ...levelBuckets[2], ...lowestLevel];
}

// Section 1: No pre-existing leagues
describe('expandPyramid — no pre-existing leagues', () => {
    // 1a: not enough clubs for even a single league
    it('1a: returns empty pyramid when waiting clubs are fewer than a full league', () => {
        const waitingClubs = createWaitingClubs(0, LEAGUE_NUMBER_OF_TEAMS - 1);

        const result = expandPyramid([], waitingClubs, 1);

        expect(result).toHaveLength(0);
        assertPlacedClubsAreUnique(result);
    });

    // 1b: just enough clubs for exactly one league
    it('1b: creates exactly one league at division level 0 when waiting clubs fill one league exactly', () => {
        const waitingClubs = createWaitingClubs(1);

        const result = expandPyramid([], waitingClubs, 1);

        expect(result).toHaveLength(1);
        expect(result[0].divisionLevel).toBe(0);
        expect(result[0].serialNumberOnDivisionLevel).toBe(0);
        expect(result[0].promotesTo).toBeNull();
        expect(result[0].clubs).toHaveLength(LEAGUE_NUMBER_OF_TEAMS);
        assertPlacedClubsAreUnique(result);
    });

    // 1c: enough for one league plus surplus clubs
    it('1c: creates one league and leaves surplus clubs unplaced when waiting clubs exceed one league but not two', () => {
        const waitingClubs = createWaitingClubs(1, surplus(3));

        const result = expandPyramid([], waitingClubs, 1);

        expect(result).toHaveLength(1);
        expect(result[0].clubs).toHaveLength(LEAGUE_NUMBER_OF_TEAMS);
        assertSurplusClubsAreUnplaced(waitingClubs, 1, result);
        assertPlacedClubsAreUnique(result);
    });

    // 1d: enough for one child on second level (+ surplus)
    it('1d: creates root + one second-level child when waiting clubs fill two leagues', () => {
        const waitingClubs = createWaitingClubs(2, surplus(2));

        const result = expandPyramid([], waitingClubs, 1);
        const root = result.find(l => l.divisionLevel === 0 && l.serialNumberOnDivisionLevel === 0);
        const secondLevelLeagues = result.filter(l => l.divisionLevel === 1);

        expect(result).toHaveLength(2);
        expect(root).toBeDefined();
        expect(secondLevelLeagues).toHaveLength(1);
        expect(secondLevelLeagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(secondLevelLeagues[0].promotesTo).toBe(root);
        assertSurplusClubsAreUnplaced(waitingClubs, 2, result);
        assertPlacedClubsAreUnique(result);
    });

    // 1e: enough for second level to be fully occupied (+ surplus)
    it('1e: creates root + two second-level children when waiting clubs fill three leagues', () => {
        const waitingClubs = createWaitingClubs(3, surplus(1));

        const result = expandPyramid([], waitingClubs, 1);
        const root = result.find(l => l.divisionLevel === 0 && l.serialNumberOnDivisionLevel === 0);
        const secondLevelLeagues = result.filter(l => l.divisionLevel === 1)
            .sort((a, b) => a.serialNumberOnDivisionLevel - b.serialNumberOnDivisionLevel);

        expect(result).toHaveLength(3);
        expect(root).toBeDefined();
        expect(secondLevelLeagues).toHaveLength(2);
        expect(secondLevelLeagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(secondLevelLeagues[1].serialNumberOnDivisionLevel).toBe(1);
        expect(secondLevelLeagues[0].promotesTo).toBe(root);
        expect(secondLevelLeagues[1].promotesTo).toBe(root);
        assertSurplusClubsAreUnplaced(waitingClubs, 3, result);
        assertPlacedClubsAreUnique(result);
    });

    // 1f: enough for second level full + one child on third level (+ surplus)
    it('1f: creates one third-level child after filling second level', () => {
        const waitingClubs = createWaitingClubs(4, surplus(4));

        const result = expandPyramid([], waitingClubs, 1);
        const root = result.find(l => l.divisionLevel === 0 && l.serialNumberOnDivisionLevel === 0);
        const secondLevelLeagues = result.filter(l => l.divisionLevel === 1)
            .sort((a, b) => a.serialNumberOnDivisionLevel - b.serialNumberOnDivisionLevel);
        const thirdLevelLeagues = result.filter(l => l.divisionLevel === 2)
            .sort((a, b) => a.serialNumberOnDivisionLevel - b.serialNumberOnDivisionLevel);

        expect(result).toHaveLength(4);
        expect(root).toBeDefined();
        expect(secondLevelLeagues).toHaveLength(2);
        expect(thirdLevelLeagues).toHaveLength(1);
        expect(thirdLevelLeagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(thirdLevelLeagues[0].promotesTo).toBe(secondLevelLeagues[0]);
        assertSurplusClubsAreUnplaced(waitingClubs, 4, result);
        assertPlacedClubsAreUnique(result);
    });
});

// Section 2: One pre-existing topmost league
describe('expandPyramid — one pre-existing topmost league', () => {
    // 2a: not enough clubs for a new league
    it('2a: keeps pyramid unchanged when waiting clubs are fewer than a full league', () => {
        const topLeague = createPreExistingTopLeague(1);
        const waitingClubs = createWaitingClubs(0, LEAGUE_NUMBER_OF_TEAMS - 1);

        const result = expandPyramid([topLeague], waitingClubs, 1);

        expect(result).toHaveLength(1);
        expect(result[0]).toBe(topLeague);
        assertPlacedClubsAreUnique(result);
    });

    // 2b: enough for exactly one new league
    it('2b: adds one second-level child under the pre-existing top league', () => {
        const topLeague = createPreExistingTopLeague(1);
        const waitingClubs = createWaitingClubs(1);

        const result = expandPyramid([topLeague], waitingClubs, 1);
        const secondLevelLeagues = getLeaguesOnLevel(result, 1);

        expect(result).toHaveLength(2);
        expect(secondLevelLeagues).toHaveLength(1);
        expect(secondLevelLeagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(secondLevelLeagues[0].promotesTo).toBe(topLeague);
        expect(secondLevelLeagues[0].clubs).toHaveLength(LEAGUE_NUMBER_OF_TEAMS);
        assertPlacedClubsAreUnique(result);
    });

    // 2c: one new league plus surplus clubs
    it('2c: adds one second-level child and keeps surplus clubs unplaced', () => {
        const topLeague = createPreExistingTopLeague(1);
        const waitingClubs = createWaitingClubs(1, surplus(2));

        const result = expandPyramid([topLeague], waitingClubs, 1);
        const secondLevelLeagues = getLeaguesOnLevel(result, 1);

        expect(result).toHaveLength(2);
        expect(secondLevelLeagues).toHaveLength(1);
        expect(secondLevelLeagues[0].promotesTo).toBe(topLeague);
        assertSurplusClubsAreUnplaced(waitingClubs, 1, result);
        assertPlacedClubsAreUnique(result);
    });

    // 2d: enough to fully occupy second level
    it('2d: adds two second-level children under the pre-existing top league', () => {
        const topLeague = createPreExistingTopLeague(1);
        const waitingClubs = createWaitingClubs(2, surplus(1));

        const result = expandPyramid([topLeague], waitingClubs, 1);
        const secondLevelLeagues = getLeaguesOnLevel(result, 1);

        expect(result).toHaveLength(3);
        expect(secondLevelLeagues).toHaveLength(2);
        expect(secondLevelLeagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(secondLevelLeagues[1].serialNumberOnDivisionLevel).toBe(1);
        expect(secondLevelLeagues[0].promotesTo).toBe(topLeague);
        expect(secondLevelLeagues[1].promotesTo).toBe(topLeague);
        assertSurplusClubsAreUnplaced(waitingClubs, 2, result);
        assertPlacedClubsAreUnique(result);
    });

    // 2e: second level full + first third-level child
    it('2e: adds one third-level child under the first second-level league after filling second level', () => {
        const topLeague = createPreExistingTopLeague(1);
        const waitingClubs = createWaitingClubs(3, surplus(3));

        const result = expandPyramid([topLeague], waitingClubs, 1);
        const secondLevelLeagues = getLeaguesOnLevel(result, 1);
        const thirdLevelLeagues = getLeaguesOnLevel(result, 2);

        expect(result).toHaveLength(4);
        expect(secondLevelLeagues).toHaveLength(2);
        expect(thirdLevelLeagues).toHaveLength(1);
        expect(thirdLevelLeagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(thirdLevelLeagues[0].promotesTo).toBe(secondLevelLeagues[0]);
        assertSurplusClubsAreUnplaced(waitingClubs, 3, result);
        assertPlacedClubsAreUnique(result);
    });

    // 2f: second level full + two third-level children under first second-level league
    it('2f: adds two third-level children under same second-level parent before moving to next parent', () => {
        const topLeague = createPreExistingTopLeague(1);
        const waitingClubs = createWaitingClubs(4, surplus(5));

        const result = expandPyramid([topLeague], waitingClubs, 1);
        const secondLevelLeagues = getLeaguesOnLevel(result, 1);
        const thirdLevelLeagues = getLeaguesOnLevel(result, 2);

        expect(result).toHaveLength(5);
        expect(secondLevelLeagues).toHaveLength(2);
        expect(thirdLevelLeagues).toHaveLength(2);
        expect(thirdLevelLeagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(thirdLevelLeagues[1].serialNumberOnDivisionLevel).toBe(1);
        expect(thirdLevelLeagues[0].promotesTo).toBe(secondLevelLeagues[0]);
        expect(thirdLevelLeagues[1].promotesTo).toBe(secondLevelLeagues[0]);
        assertSurplusClubsAreUnplaced(waitingClubs, 4, result);
        assertPlacedClubsAreUnique(result);
    });
});

// Section 3: Pre-existing four-level pyramid; levels 1 and 2 full, level 3 has three leagues
describe('expandPyramid — pre-existing four-level pyramid with partially occupied lowest level', () => {
    // 3a: not enough clubs for any new league
    it('3a: keeps pyramid unchanged when waiting clubs are fewer than a full league', () => {
        const initialPyramid = createPreExistingFourLevelPyramidWithThreeLowestLeagues(1);
        const waitingClubs = createWaitingClubs(0, LEAGUE_NUMBER_OF_TEAMS - 1);

        const result = expandPyramid(initialPyramid, waitingClubs, 1);

        expect(result).toHaveLength(10);
        expect(getLeaguesOnLevel(result, 3)).toHaveLength(3);
        expect(getLeaguesOnLevel(result, 4)).toHaveLength(0);
        assertPlacedClubsAreUnique(result);
    });

    // 3b: one new league still stays on lowest existing level
    it('3b: adds one league to level 3 and does not create level 4 yet', () => {
        const initialPyramid = createPreExistingFourLevelPyramidWithThreeLowestLeagues(1);
        const waitingClubs = createWaitingClubs(1, surplus(2));

        const result = expandPyramid(initialPyramid, waitingClubs, 1);
        const level2Leagues = getLeaguesOnLevel(result, 2);
        const level3Leagues = getLeaguesOnLevel(result, 3);
        const addedLevel3League = level3Leagues.find(l => l.serialNumberOnDivisionLevel === 3);

        expect(result).toHaveLength(11);
        expect(level3Leagues).toHaveLength(4);
        expect(getLeaguesOnLevel(result, 4)).toHaveLength(0);
        expect(addedLevel3League).toBeDefined();
        expect(addedLevel3League!.promotesTo).toBe(level2Leagues[1]);
        assertSurplusClubsAreUnplaced(waitingClubs, 1, result);
        assertPlacedClubsAreUnique(result);
    });

    // 3c: two new leagues keep filling level 3 from left to right
    it('3c: adds two level-3 leagues and assigns parents according to first vacant parent order', () => {
        const initialPyramid = createPreExistingFourLevelPyramidWithThreeLowestLeagues(1);
        const waitingClubs = createWaitingClubs(2, surplus(1));

        const result = expandPyramid(initialPyramid, waitingClubs, 1);
        const level2Leagues = getLeaguesOnLevel(result, 2);
        const level3Leagues = getLeaguesOnLevel(result, 3);
        const level3_3 = level3Leagues.find(l => l.serialNumberOnDivisionLevel === 3);
        const level3_4 = level3Leagues.find(l => l.serialNumberOnDivisionLevel === 4);

        expect(result).toHaveLength(12);
        expect(level3Leagues).toHaveLength(5);
        expect(getLeaguesOnLevel(result, 4)).toHaveLength(0);
        expect(level3_3).toBeDefined();
        expect(level3_4).toBeDefined();
        expect(level3_3!.promotesTo).toBe(level2Leagues[1]);
        expect(level3_4!.promotesTo).toBe(level2Leagues[2]);
        assertSurplusClubsAreUnplaced(waitingClubs, 2, result);
        assertPlacedClubsAreUnique(result);
    });

    // 3d: exactly enough to fully occupy current lowest level (level 3)
    it('3d: fills level 3 to eight leagues and still does not create level 4', () => {
        const initialPyramid = createPreExistingFourLevelPyramidWithThreeLowestLeagues(1);
        const waitingClubs = createWaitingClubs(5, surplus(3));

        const result = expandPyramid(initialPyramid, waitingClubs, 1);
        const level3Leagues = getLeaguesOnLevel(result, 3);

        expect(result).toHaveLength(15);
        expect(level3Leagues).toHaveLength(8);
        expect(level3Leagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(level3Leagues[7].serialNumberOnDivisionLevel).toBe(7);
        expect(getLeaguesOnLevel(result, 4)).toHaveLength(0);
        assertSurplusClubsAreUnplaced(waitingClubs, 5, result);
        assertPlacedClubsAreUnique(result);
    });

    // 3e: one more than level-3 fill should start level 4
    it('3e: creates first level-4 league only after level 3 becomes full', () => {
        const initialPyramid = createPreExistingFourLevelPyramidWithThreeLowestLeagues(1);
        const waitingClubs = createWaitingClubs(6, surplus(4));

        const result = expandPyramid(initialPyramid, waitingClubs, 1);
        const level3Leagues = getLeaguesOnLevel(result, 3);
        const level4Leagues = getLeaguesOnLevel(result, 4);

        expect(result).toHaveLength(16);
        expect(level3Leagues).toHaveLength(8);
        expect(level4Leagues).toHaveLength(1);
        expect(level4Leagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(level4Leagues[0].promotesTo).toBe(level3Leagues[0]);
        assertSurplusClubsAreUnplaced(waitingClubs, 6, result);
        assertPlacedClubsAreUnique(result);
    });

    // 3f: two beyond level-3 fill should create two level-4 children under same first parent
    it('3f: creates two level-4 leagues under the first level-3 parent before moving to next parent', () => {
        const initialPyramid = createPreExistingFourLevelPyramidWithThreeLowestLeagues(1);
        const waitingClubs = createWaitingClubs(7, surplus(5));

        const result = expandPyramid(initialPyramid, waitingClubs, 1);
        const level3Leagues = getLeaguesOnLevel(result, 3);
        const level4Leagues = getLeaguesOnLevel(result, 4);

        expect(result).toHaveLength(17);
        expect(level3Leagues).toHaveLength(8);
        expect(level4Leagues).toHaveLength(2);
        expect(level4Leagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(level4Leagues[1].serialNumberOnDivisionLevel).toBe(1);
        expect(level4Leagues[0].promotesTo).toBe(level3Leagues[0]);
        expect(level4Leagues[1].promotesTo).toBe(level3Leagues[0]);
        assertSurplusClubsAreUnplaced(waitingClubs, 7, result);
        assertPlacedClubsAreUnique(result);
    });
});

// Section 4: No pre-existing leagues, custom span factor 4
describe('expandPyramid — no pre-existing leagues, span factor 4', () => {
    const spanFactor = 4;

    // 4a: not enough clubs for even a single league
    it('4a: returns empty pyramid when waiting clubs are fewer than a full league', () => {
        const waitingClubs = createWaitingClubs(0, LEAGUE_NUMBER_OF_TEAMS - 1);

        const result = expandPyramidWithSpan([], waitingClubs, 1, spanFactor);

        expect(result).toHaveLength(0);
        assertPlacedClubsAreUnique(result);
    });

    // 4b: just enough clubs for exactly one league
    it('4b: creates exactly one league at division level 0 when waiting clubs fill one league exactly', () => {
        const waitingClubs = createWaitingClubs(1);

        const result = expandPyramidWithSpan([], waitingClubs, 1, spanFactor);

        expect(result).toHaveLength(1);
        expect(result[0].divisionLevel).toBe(0);
        expect(result[0].serialNumberOnDivisionLevel).toBe(0);
        expect(result[0].promotesTo).toBeNull();
        expect(result[0].clubs).toHaveLength(LEAGUE_NUMBER_OF_TEAMS);
        assertPlacedClubsAreUnique(result);
    });

    // 4c: enough for one league plus surplus clubs
    it('4c: creates one league and leaves surplus clubs unplaced when waiting clubs exceed one league but not two', () => {
        const waitingClubs = createWaitingClubs(1, surplus(3));

        const result = expandPyramidWithSpan([], waitingClubs, 1, spanFactor);

        expect(result).toHaveLength(1);
        expect(result[0].clubs).toHaveLength(LEAGUE_NUMBER_OF_TEAMS);
        assertSurplusClubsAreUnplaced(waitingClubs, 1, result);
        assertPlacedClubsAreUnique(result);
    });

    // 4d: enough for one child on second level (+ surplus)
    it('4d: creates root + one second-level child when waiting clubs fill two leagues', () => {
        const waitingClubs = createWaitingClubs(2, surplus(2));

        const result = expandPyramidWithSpan([], waitingClubs, 1, spanFactor);
        const root = result.find(l => l.divisionLevel === 0 && l.serialNumberOnDivisionLevel === 0);
        const secondLevelLeagues = getLeaguesOnLevel(result, 1);

        expect(result).toHaveLength(2);
        expect(root).toBeDefined();
        expect(secondLevelLeagues).toHaveLength(1);
        expect(secondLevelLeagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(secondLevelLeagues[0].promotesTo).toBe(root);
        assertSurplusClubsAreUnplaced(waitingClubs, 2, result);
        assertPlacedClubsAreUnique(result);
    });

    // 4e: enough for second level to be fully occupied (+ surplus)
    it('4e: creates root + four second-level children when waiting clubs fill five leagues', () => {
        const waitingClubs = createWaitingClubs(5, surplus(1));

        const result = expandPyramidWithSpan([], waitingClubs, 1, spanFactor);
        const root = result.find(l => l.divisionLevel === 0 && l.serialNumberOnDivisionLevel === 0);
        const secondLevelLeagues = getLeaguesOnLevel(result, 1);

        expect(result).toHaveLength(5);
        expect(root).toBeDefined();
        expect(secondLevelLeagues).toHaveLength(4);
        expect(secondLevelLeagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(secondLevelLeagues[3].serialNumberOnDivisionLevel).toBe(3);
        secondLevelLeagues.forEach(league => expect(league.promotesTo).toBe(root));
        assertSurplusClubsAreUnplaced(waitingClubs, 5, result);
        assertPlacedClubsAreUnique(result);
    });

    // 4f: enough for second level full + one child on third level (+ surplus)
    it('4f: creates one third-level child after filling second level', () => {
        const waitingClubs = createWaitingClubs(6, surplus(4));

        const result = expandPyramidWithSpan([], waitingClubs, 1, spanFactor);
        const secondLevelLeagues = getLeaguesOnLevel(result, 1);
        const thirdLevelLeagues = getLeaguesOnLevel(result, 2);

        expect(result).toHaveLength(6);
        expect(secondLevelLeagues).toHaveLength(4);
        expect(thirdLevelLeagues).toHaveLength(1);
        expect(thirdLevelLeagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(thirdLevelLeagues[0].promotesTo).toBe(secondLevelLeagues[0]);
        assertSurplusClubsAreUnplaced(waitingClubs, 6, result);
        assertPlacedClubsAreUnique(result);
    });
});

// Section 5: One pre-existing topmost league, custom span factor 4
describe('expandPyramid — one pre-existing topmost league, span factor 4', () => {
    const spanFactor = 4;

    // 5a: not enough clubs for a new league
    it('5a: keeps pyramid unchanged when waiting clubs are fewer than a full league', () => {
        const topLeague = createPreExistingTopLeague(1);
        const waitingClubs = createWaitingClubs(0, LEAGUE_NUMBER_OF_TEAMS - 1);

        const result = expandPyramidWithSpan([topLeague], waitingClubs, 1, spanFactor);

        expect(result).toHaveLength(1);
        expect(result[0]).toBe(topLeague);
        assertPlacedClubsAreUnique(result);
    });

    // 5b: enough for exactly one new league
    it('5b: adds one second-level child under the pre-existing top league', () => {
        const topLeague = createPreExistingTopLeague(1);
        const waitingClubs = createWaitingClubs(1);

        const result = expandPyramidWithSpan([topLeague], waitingClubs, 1, spanFactor);
        const secondLevelLeagues = getLeaguesOnLevel(result, 1);

        expect(result).toHaveLength(2);
        expect(secondLevelLeagues).toHaveLength(1);
        expect(secondLevelLeagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(secondLevelLeagues[0].promotesTo).toBe(topLeague);
        expect(secondLevelLeagues[0].clubs).toHaveLength(LEAGUE_NUMBER_OF_TEAMS);
        assertPlacedClubsAreUnique(result);
    });

    // 5c: one new league plus surplus clubs
    it('5c: adds one second-level child and keeps surplus clubs unplaced', () => {
        const topLeague = createPreExistingTopLeague(1);
        const waitingClubs = createWaitingClubs(1, surplus(2));

        const result = expandPyramidWithSpan([topLeague], waitingClubs, 1, spanFactor);
        const secondLevelLeagues = getLeaguesOnLevel(result, 1);

        expect(result).toHaveLength(2);
        expect(secondLevelLeagues).toHaveLength(1);
        expect(secondLevelLeagues[0].promotesTo).toBe(topLeague);
        assertSurplusClubsAreUnplaced(waitingClubs, 1, result);
        assertPlacedClubsAreUnique(result);
    });

    // 5d: enough to fully occupy second level
    it('5d: adds four second-level children under the pre-existing top league', () => {
        const topLeague = createPreExistingTopLeague(1);
        const waitingClubs = createWaitingClubs(4, surplus(1));

        const result = expandPyramidWithSpan([topLeague], waitingClubs, 1, spanFactor);
        const secondLevelLeagues = getLeaguesOnLevel(result, 1);

        expect(result).toHaveLength(5);
        expect(secondLevelLeagues).toHaveLength(4);
        expect(secondLevelLeagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(secondLevelLeagues[3].serialNumberOnDivisionLevel).toBe(3);
        secondLevelLeagues.forEach(league => expect(league.promotesTo).toBe(topLeague));
        assertSurplusClubsAreUnplaced(waitingClubs, 4, result);
        assertPlacedClubsAreUnique(result);
    });

    // 5e: second level full + first third-level child
    it('5e: adds one third-level child under the first second-level league after filling second level', () => {
        const topLeague = createPreExistingTopLeague(1);
        const waitingClubs = createWaitingClubs(5, surplus(3));

        const result = expandPyramidWithSpan([topLeague], waitingClubs, 1, spanFactor);
        const secondLevelLeagues = getLeaguesOnLevel(result, 1);
        const thirdLevelLeagues = getLeaguesOnLevel(result, 2);

        expect(result).toHaveLength(6);
        expect(secondLevelLeagues).toHaveLength(4);
        expect(thirdLevelLeagues).toHaveLength(1);
        expect(thirdLevelLeagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(thirdLevelLeagues[0].promotesTo).toBe(secondLevelLeagues[0]);
        assertSurplusClubsAreUnplaced(waitingClubs, 5, result);
        assertPlacedClubsAreUnique(result);
    });

    // 5f: second level full + two third-level children under first second-level league
    it('5f: adds two third-level children under same second-level parent before moving to next parent', () => {
        const topLeague = createPreExistingTopLeague(1);
        const waitingClubs = createWaitingClubs(6, surplus(5));

        const result = expandPyramidWithSpan([topLeague], waitingClubs, 1, spanFactor);
        const secondLevelLeagues = getLeaguesOnLevel(result, 1);
        const thirdLevelLeagues = getLeaguesOnLevel(result, 2);

        expect(result).toHaveLength(7);
        expect(secondLevelLeagues).toHaveLength(4);
        expect(thirdLevelLeagues).toHaveLength(2);
        expect(thirdLevelLeagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(thirdLevelLeagues[1].serialNumberOnDivisionLevel).toBe(1);
        expect(thirdLevelLeagues[0].promotesTo).toBe(secondLevelLeagues[0]);
        expect(thirdLevelLeagues[1].promotesTo).toBe(secondLevelLeagues[0]);
        assertSurplusClubsAreUnplaced(waitingClubs, 6, result);
        assertPlacedClubsAreUnique(result);
    });
});

// Section 6: Pre-existing four-level pyramid, custom span factor 4
describe('expandPyramid — pre-existing four-level pyramid with partially occupied lowest level, span factor 4', () => {
    const spanFactor = 4;

    // 6a: not enough clubs for any new league
    it('6a: keeps pyramid unchanged when waiting clubs are fewer than a full league', () => {
        const initialPyramid = createPreExistingFourLevelPyramidWithThreeLowestLeaguesAndCustomSpan(1, spanFactor);
        const waitingClubs = createWaitingClubs(0, LEAGUE_NUMBER_OF_TEAMS - 1);

        const result = expandPyramidWithSpan(initialPyramid, waitingClubs, 1, spanFactor);

        expect(result).toHaveLength(24);
        expect(getLeaguesOnLevel(result, 3)).toHaveLength(3);
        expect(getLeaguesOnLevel(result, 4)).toHaveLength(0);
        assertPlacedClubsAreUnique(result);
    });

    // 6b: one new league still stays on lowest existing level
    it('6b: adds one league to level 3 and does not create level 4 yet', () => {
        const initialPyramid = createPreExistingFourLevelPyramidWithThreeLowestLeaguesAndCustomSpan(1, spanFactor);
        const waitingClubs = createWaitingClubs(1, surplus(2));

        const result = expandPyramidWithSpan(initialPyramid, waitingClubs, 1, spanFactor);
        const level2Leagues = getLeaguesOnLevel(result, 2);
        const level3Leagues = getLeaguesOnLevel(result, 3);
        const addedLevel3League = level3Leagues.find(l => l.serialNumberOnDivisionLevel === 3);

        expect(result).toHaveLength(25);
        expect(level3Leagues).toHaveLength(4);
        expect(getLeaguesOnLevel(result, 4)).toHaveLength(0);
        expect(addedLevel3League).toBeDefined();
        expect(addedLevel3League!.promotesTo).toBe(level2Leagues[0]);
        assertSurplusClubsAreUnplaced(waitingClubs, 1, result);
        assertPlacedClubsAreUnique(result);
    });

    // 6c: two new leagues keep filling level 3 from left to right
    it('6c: adds two level-3 leagues and assigns parents according to first vacant parent order', () => {
        const initialPyramid = createPreExistingFourLevelPyramidWithThreeLowestLeaguesAndCustomSpan(1, spanFactor);
        const waitingClubs = createWaitingClubs(2, surplus(1));

        const result = expandPyramidWithSpan(initialPyramid, waitingClubs, 1, spanFactor);
        const level2Leagues = getLeaguesOnLevel(result, 2);
        const level3Leagues = getLeaguesOnLevel(result, 3);
        const level3_3 = level3Leagues.find(l => l.serialNumberOnDivisionLevel === 3);
        const level3_4 = level3Leagues.find(l => l.serialNumberOnDivisionLevel === 4);

        expect(result).toHaveLength(26);
        expect(level3Leagues).toHaveLength(5);
        expect(getLeaguesOnLevel(result, 4)).toHaveLength(0);
        expect(level3_3).toBeDefined();
        expect(level3_4).toBeDefined();
        expect(level3_3!.promotesTo).toBe(level2Leagues[0]);
        expect(level3_4!.promotesTo).toBe(level2Leagues[1]);
        assertSurplusClubsAreUnplaced(waitingClubs, 2, result);
        assertPlacedClubsAreUnique(result);
    });

    // 6d: exactly enough to fully occupy current lowest level (level 3)
    it('6d: fills level 3 to sixty-four leagues and still does not create level 4', () => {
        const initialPyramid = createPreExistingFourLevelPyramidWithThreeLowestLeaguesAndCustomSpan(1, spanFactor);
        const waitingClubs = createWaitingClubs(61, surplus(3));

        const result = expandPyramidWithSpan(initialPyramid, waitingClubs, 1, spanFactor);
        const level3Leagues = getLeaguesOnLevel(result, 3);

        expect(result).toHaveLength(85);
        expect(level3Leagues).toHaveLength(64);
        expect(level3Leagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(level3Leagues[63].serialNumberOnDivisionLevel).toBe(63);
        expect(getLeaguesOnLevel(result, 4)).toHaveLength(0);
        assertSurplusClubsAreUnplaced(waitingClubs, 61, result);
        assertPlacedClubsAreUnique(result);
    });

    // 6e: one more than level-3 fill should start level 4
    it('6e: creates first level-4 league only after level 3 becomes full', () => {
        const initialPyramid = createPreExistingFourLevelPyramidWithThreeLowestLeaguesAndCustomSpan(1, spanFactor);
        const waitingClubs = createWaitingClubs(62, surplus(4));

        const result = expandPyramidWithSpan(initialPyramid, waitingClubs, 1, spanFactor);
        const level3Leagues = getLeaguesOnLevel(result, 3);
        const level4Leagues = getLeaguesOnLevel(result, 4);

        expect(result).toHaveLength(86);
        expect(level3Leagues).toHaveLength(64);
        expect(level4Leagues).toHaveLength(1);
        expect(level4Leagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(level4Leagues[0].promotesTo).toBe(level3Leagues[0]);
        assertSurplusClubsAreUnplaced(waitingClubs, 62, result);
        assertPlacedClubsAreUnique(result);
    });

    // 6f: two beyond level-3 fill should create two level-4 children under same first parent
    it('6f: creates two level-4 leagues under the first level-3 parent before moving to next parent', () => {
        const initialPyramid = createPreExistingFourLevelPyramidWithThreeLowestLeaguesAndCustomSpan(1, spanFactor);
        const waitingClubs = createWaitingClubs(63, surplus(5));

        const result = expandPyramidWithSpan(initialPyramid, waitingClubs, 1, spanFactor);
        const level3Leagues = getLeaguesOnLevel(result, 3);
        const level4Leagues = getLeaguesOnLevel(result, 4);

        expect(result).toHaveLength(87);
        expect(level3Leagues).toHaveLength(64);
        expect(level4Leagues).toHaveLength(2);
        expect(level4Leagues[0].serialNumberOnDivisionLevel).toBe(0);
        expect(level4Leagues[1].serialNumberOnDivisionLevel).toBe(1);
        expect(level4Leagues[0].promotesTo).toBe(level3Leagues[0]);
        expect(level4Leagues[1].promotesTo).toBe(level3Leagues[0]);
        assertSurplusClubsAreUnplaced(waitingClubs, 63, result);
        assertPlacedClubsAreUnique(result);
    });
});

describe('expandPyramid — input validation', () => {
    it('throws when leagueSpanFactor is not a positive integer', () => {
        const waitingClubs = createWaitingClubs(1);

        expect(() => expandPyramid([], waitingClubs, 1, 0)).toThrow('leagueSpanFactor must be a positive integer');
        expect(() => expandPyramid([], waitingClubs, 1, -2)).toThrow('leagueSpanFactor must be a positive integer');
        expect(() => expandPyramid([], waitingClubs, 1, 1.5)).toThrow('leagueSpanFactor must be a positive integer');
    });
});

describe('expandPyramid — reliability guarantees', () => {
    it('supports id-only parent linkage when promotesTo object references are missing', () => {
        const root = new League(1, 0, 0, null);
        root.id = 100;

        const existingChild = new League(1, 1, 0, null);
        existingChild.id = 200;
        existingChild.promotesToId = 100;

        const waitingClubs = createWaitingClubs(1);
        const result = expandPyramid([root, existingChild], waitingClubs, 1);
        const level1Leagues = getLeaguesOnLevel(result, 1);

        expect(level1Leagues).toHaveLength(2);
        expect(level1Leagues[1].serialNumberOnDivisionLevel).toBe(1);
        expect(level1Leagues[1].promotesTo).toBe(root);
    });

    it('does not mutate the input leagues array', () => {
        const topLeague = createPreExistingTopLeague(1);
        const initialLeagues = [topLeague];
        const waitingClubs = createWaitingClubs(1);

        const result = expandPyramid(initialLeagues, waitingClubs, 1);

        expect(initialLeagues).toHaveLength(1);
        expect(result).toHaveLength(2);
        expect(result).not.toBe(initialLeagues);
    });

    it('preserves existing league order in the returned array', () => {
        const root = new League(1, 0, 0, null);
        const childA = new League(1, 1, 0, root);
        const childB = new League(1, 1, 1, root);
        const intentionallyUnsortedInput = [childB, root, childA];

        const result = expandPyramid(intentionallyUnsortedInput, createWaitingClubs(1), 1);

        expect(result[0]).toBe(childB);
        expect(result[1]).toBe(root);
        expect(result[2]).toBe(childA);
    });

    it('assigns provided season only to newly created leagues and leaves existing seasons untouched', () => {
        const existingTopLeague = createPreExistingTopLeague(1);
        const existingLeagues = [existingTopLeague];
        const targetSeason = 5;

        const result = expandPyramid(existingLeagues, createWaitingClubs(2), targetSeason);
        const newlyCreatedLeagues = result.filter(league => !existingLeagues.includes(league));

        expect(existingTopLeague.season).toBe(1);
        expect(newlyCreatedLeagues).toHaveLength(2);
        newlyCreatedLeagues.forEach(league => expect(league.season).toBe(targetSeason));
    });

    it('keeps waiting-list club order when slicing into league chunks', () => {
        const waitingClubs = [42, 5, 9, 100, 8, 7, 6, 11, 13, 15, 1, 3, 999];
        const result = expandPyramid([], waitingClubs, 1);
        const placedClubIds = getPlacedClubIds(result);
        const fullLeagues = Math.floor(waitingClubs.length / LEAGUE_NUMBER_OF_TEAMS);
        const placedClubCount = LEAGUE_NUMBER_OF_TEAMS * fullLeagues;

        expect(placedClubIds).toEqual(waitingClubs.slice(0, placedClubCount));
        expect(result).toHaveLength(fullLeagues);
        result.forEach((league, index) => {
            const start = index * LEAGUE_NUMBER_OF_TEAMS;
            const end = start + LEAGUE_NUMBER_OF_TEAMS;
            expect(league.clubs!.map((club: any) => club.id)).toEqual(waitingClubs.slice(start, end));
        });
    });
});
