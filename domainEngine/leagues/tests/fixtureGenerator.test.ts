import Club from "../../../domainModel/club/Club";
import { generateFixtures } from "../fixtureGenerator";

const createDummyClubs = async (): Promise<Club[]> => {
    const clubNames = [
        "Aster Albion",
        "Boreal Borough",
        "Cinder City",
        "Dawn Dynamo",
        "Ember Estate",
        "Fable Forest",
        "Gale Grove",
        "Harbor Heights",
        "Ivory Isles",
        "Jade Junction",
        "Kestrel Kings",
        "Lumen Lakes"
    ];

    const clubs: Club[] = [];

    for (const name of clubNames) {
        clubs.push(await Club.create(name, "password123"));
    }

    return clubs;
};

describe('Fixture Generator', () => {
    it('assert structural correctness of generated fixtures as a whole', async () => {
        // Given: 12 clubs and a league
        const clubs = await createDummyClubs();
        const league = { id: 1, name: 'Testiliiga' } as any;

        // When: we generate fixtures for these clubs and the league
        const fixtures = generateFixtures(clubs, league);

        // Then: there should be 132 matches (11 home + 11 away for each of the 12 teams)
        expect(fixtures.length).toEqual(132);

        // And: there should be 22 rounds (11 home + 11 away) for each team, and each team should play only once per round
        const rounds = new Set(fixtures.map(f => f.week));
        expect(rounds.size).toEqual(22);

        for (const round of rounds) {
            const matchesInRound = fixtures.filter(f => f.week === round);
            const teamsInRound = new Set<string>();

            for (const match of matchesInRound) {
                // Each match should have a home and away team
                expect(match.homeClub).toBeDefined();
                expect(match.awayClub).toBeDefined();

                // Home and away teams should be different
                expect(match.homeClub.name).not.toEqual(match.awayClub.name);

                // Each team should only appear once in the round
                expect(teamsInRound.has(match.homeClub.name)).toBeFalsy();
                expect(teamsInRound.has(match.awayClub.name)).toBeFalsy();

                teamsInRound.add(match.homeClub.name);
                teamsInRound.add(match.awayClub.name);
            }
        }
    });

    it('assert correct fixtures for two clubs', async () => {
        // Given: 12 clubs and a league
        const clubs = await createDummyClubs();
        const clubA = clubs[0];
        const clubB = clubs[7];
        const league = { id: 1, name: 'Testiliiga' } as any;

        // When: we generate fixtures for these clubs
        const fixtures = generateFixtures(clubs, league);

        const homeFixturesForClubA = fixtures.filter(f => f.homeClub.name === clubA.name);
        const awayFixturesForClubA = fixtures.filter(f => f.awayClub.name === clubA.name);

        const homeFixturesForClubB = fixtures.filter(f => f.homeClub.name === clubB.name);
        const awayFixturesForClubB = fixtures.filter(f => f.awayClub.name === clubB.name);

        // Then: each club should have 11 home and 11 away games
        expect(homeFixturesForClubA.length).toEqual(11);
        expect(homeFixturesForClubA.length).toEqual(awayFixturesForClubA.length);

        expect(homeFixturesForClubB.length).toEqual(11);
        expect(homeFixturesForClubB.length).toEqual(awayFixturesForClubB.length);

        // And: each club should play a game per week and only a game per week
        const weeksForClubA = fixtures
            .filter(f => f.homeClub.name === clubA.name || f.awayClub.name === clubA.name)
            .map(f => f.week);
        const weeksForClubB = fixtures
            .filter(f => f.homeClub.name === clubB.name || f.awayClub.name === clubB.name)
            .map(f => f.week);

        expect(new Set(weeksForClubA).size).toEqual(22);
        expect(new Set(weeksForClubB).size).toEqual(22);

        // And: each club should play against every other club exactly once at home and once away
        const awayOpponentsForClubA = homeFixturesForClubA.map(f => f.awayClub.name);
        const awayOpponentsForClubB = homeFixturesForClubB.map(f => f.awayClub.name);

        expect(new Set(awayOpponentsForClubA).size).toEqual(11);
        expect(new Set(awayOpponentsForClubB).size).toEqual(11);                    
        expect(awayOpponentsForClubA).not.toContain(clubA.name);
        expect(awayOpponentsForClubB).not.toContain(clubB.name);

        const homeOpponentsForClubA = awayFixturesForClubA.map(f => f.homeClub.name);
        const homeOpponentsForClubB = awayFixturesForClubB.map(f => f.homeClub.name);

        expect(new Set(homeOpponentsForClubA).size).toEqual(11);
        expect(new Set(homeOpponentsForClubB).size).toEqual(11);
        expect(homeOpponentsForClubA).not.toContain(clubA.name);
        expect(homeOpponentsForClubB).not.toContain(clubB.name);
    });

    it('assert each pair appears exactly once as home and once as away', async () => {
        // Given: 12 clubs and a league
        const clubs = await createDummyClubs();
        const league = { id: 1, name: 'Testiliiga' } as any;

        // When: we generate fixtures for these clubs
        const fixtures = generateFixtures(clubs, league);

        for (const a of clubs) {
            for (const b of clubs) {
                if (a.name === b.name) continue;

                const aHostsB = fixtures.filter(f => f.homeClub.name === a.name && f.awayClub.name === b.name);
                expect(aHostsB.length).toEqual(1);
            }
        }
    });

    it('assert second leg is exact mirror of first leg with shifted weeks', async () => {
        // Given: 12 clubs and a league
        const clubs = await createDummyClubs();
        const league = { id: 1, name: 'Testiliiga' } as any;

        // When: we generate fixtures for these clubs
        const fixtures = generateFixtures(clubs, league);

        // Then: the second leg should be an exact mirror of the first leg with shifted weeks
        const roundsPerLeg = clubs.length - 1;
        const firstLeg  = fixtures.filter(f => f.week <= roundsPerLeg);
        const secondLeg = fixtures.filter(f => f.week > roundsPerLeg);

        expect(firstLeg.length).toEqual(secondLeg.length);

        firstLeg.forEach(f => {
            const mirror = secondLeg.find(
                s => s.homeClub.name === f.awayClub.name && s.awayClub.name === f.homeClub.name
            );
            expect(mirror).toBeDefined();
            expect(mirror!.week).toEqual(f.week + roundsPerLeg);
        });
    });

    it('assert every match is assigned to the correct league', async () => {
        // Given: 12 clubs and a league
        const clubs = await createDummyClubs();
        const league = { id: 1, name: 'Testiliiga' } as any;

        // When: we generate fixtures for these clubs
        const fixtures = generateFixtures(clubs, league);

        // Then: each fixture should be assigned to the correct league
        fixtures.forEach(f => expect(f.leagueId).toEqual(league.id));
    });
});