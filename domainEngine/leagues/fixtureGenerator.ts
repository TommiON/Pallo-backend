import Match from "../../domainModel/match/Match";
import Club from "../../domainModel/club/Club";
import League from "../../domainModel/league/League";
import { shuffleCollectionRandomly } from "../../utils/randomizer";

/**
 * Generates a fixture list for a league using the circle method for round-robin tournaments.
 * Each team plays every other team twice (home and away), resulting in 2*(n-1) rounds for n teams.
 * The second leg is a mirror of the first leg with reversed home/away.
 */
export const generateFixtures = (teams: Club[], forLeague: League): Match[] => {
    const fixtures: Match[] = [];

    const teamsForRotation: Club[] = shuffleCollectionRandomly(teams);

    const teamCount = teamsForRotation.length;
    const matchesPerRound = teamCount / 2;
    const roundsPerLeg = teamCount - 1;

    // kauden ensimmäinen puolisko: lista kierroksia, jotka ovat listoja otteluista, jotka ovat [Club, Club] -pareja
    const firstLegRounds: [Club, Club][][] = [];

    for (let round = 0; round < roundsPerLeg; round++) {
        // yhden kierroksen otteluparit
        const roundPairs: [Club, Club][] = [];

        // paritetaan joukkueita listan alusta vs. listan lopusta
        for (let i = 0; i < matchesPerRound; i++) {
            let home = teamsForRotation[i];
            let away = teamsForRotation[teamCount - 1 - i];

            // vaihdellaan listan ensimmmäisen joukkueen kotietua, jotta ei tule liian pitkiä putkia
            if (i === 0 && round % 2 === 1) {
                [home, away] = [away, home];
            }

            roundPairs.push([home, away]);
        }

        firstLegRounds.push(roundPairs);

        // kiinnitetään listan ensimmäinen joukkue
        const fixed = teamsForRotation[0];
        const rotating = teamsForRotation.slice(1);

        // rotaatio: viimeinen joukkue listan toiseksi (kiinnitetyn jälkeen), muut yhden askeleen eteenpäin
        rotating.unshift(rotating.pop()!);
        teamsForRotation.splice(0, teamsForRotation.length, fixed, ...rotating);
    }

    // luodaan kauden ensimmäisen puoliskon ottelut
    firstLegRounds.forEach((roundPairs, roundIndex) => {
        const week = roundIndex + 1;
        roundPairs.forEach(([home, away]) => {
            fixtures.push(new Match(home, away, week, forLeague));
        });
    });

    // luodaan kauden toisen puoliskon ottelut, lähtömateriaali sama mutta vaihdetaan koti <-> vieras
    firstLegRounds.forEach((roundPairs, roundIndex) => {
        const week = roundsPerLeg + roundIndex + 1;
        roundPairs.forEach(([home, away]) => {
            fixtures.push(new Match(away, home, week, forLeague));
        });
    });

    return fixtures;
}