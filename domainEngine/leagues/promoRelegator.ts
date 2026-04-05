import Club from "../../domainModel/club/Club";
import League from "../../domainModel/league/League";
import { LEAGUE_PROMOTED_FROM_TOP } from "../../domainProperties/domainProperties";

export const promoteAndRelegate = (
    oldLeagues: League[],
    promotedFromTop: number = LEAGUE_PROMOTED_FROM_TOP,
): League[] => {
    if (!Number.isInteger(promotedFromTop) || promotedFromTop < 0) {
        throw new Error("promotedFromTop must be a non-negative integer");
    }

    const leagueMap = cloneLeagueMap(oldLeagues);
    wirePromotesTo(leagueMap, oldLeagues);

    const clonedLeagues = oldLeagues.map((oldLeague) => {
        const league = leagueMap.get(oldLeague);
        if (!league) {
            throw new Error("Cloned league missing from map");
        }
        return league;
    });

    const lowestDivisionLevel = getLowestDivisionLevel(clonedLeagues);

    for (let divisionLevel = lowestDivisionLevel; divisionLevel > 1; divisionLevel--) {
        const promotionTargets = getLeaguesOnDivision(clonedLeagues, divisionLevel - 1);

        for (const targetLeague of promotionTargets) {
            const childLeagues = getChildLeagues(clonedLeagues, targetLeague);
            if (childLeagues.length === 0) {
                continue;
            }

            const childPromotionBundles = childLeagues.map((childLeague) => {
                const childClubs = getLeagueClubs(childLeague);
                const promotedCount = Math.min(promotedFromTop, childClubs.length);

                return {
                    childLeague,
                    promotedCount,
                    promotedClubs: childClubs.slice(0, promotedCount),
                    remainingChildClubs: childClubs.slice(promotedCount),
                };
            });

            const promotedClubs = childPromotionBundles.flatMap((bundle) => bundle.promotedClubs);
            if (promotedClubs.length === 0) {
                continue;
            }

            const targetClubs = getLeagueClubs(targetLeague);
            const relegatedCount = Math.min(promotedClubs.length, targetClubs.length);
            const relegatedClubs = targetClubs.slice(targetClubs.length - relegatedCount);
            const retainedTargetClubs = targetClubs.slice(0, targetClubs.length - relegatedCount);

            targetLeague.clubs = [...retainedTargetClubs, ...promotedClubs];

            let relegatedCursor = 0;
            for (const bundle of childPromotionBundles) {
                const slotsForChild = Math.min(bundle.promotedCount, relegatedClubs.length - relegatedCursor);
                const incomingRelegated = relegatedClubs.slice(relegatedCursor, relegatedCursor + slotsForChild);
                relegatedCursor += slotsForChild;

                bundle.childLeague.clubs = [...bundle.remainingChildClubs, ...incomingRelegated];
            }
        }
    }

    return clonedLeagues;
};

const cloneLeagueMap = (leagues: League[]): Map<League, League> => {
    const leagueMap = new Map<League, League>();

    for (const oldLeague of leagues) {
        const clonedLeague = new League(
            oldLeague.season,
            oldLeague.divisionLevel,
            oldLeague.serialNumberOnDivisionLevel,
            null,
        );

        clonedLeague.id = oldLeague.id;
        clonedLeague.promotesToId = oldLeague.promotesToId;
        clonedLeague.started = oldLeague.started;
        clonedLeague.finished = oldLeague.finished;
        clonedLeague.clubs = getLeagueClubs(oldLeague).map(cloneClub);

        leagueMap.set(oldLeague, clonedLeague);
    }

    return leagueMap;
};

const wirePromotesTo = (leagueMap: Map<League, League>, oldLeagues: League[]): void => {
    const oldById = new Map<number, League>();

    for (const oldLeague of oldLeagues) {
        if (oldLeague.id !== undefined) {
            oldById.set(oldLeague.id, oldLeague);
        }
    }

    for (const oldLeague of oldLeagues) {
        const clonedLeague = leagueMap.get(oldLeague);
        if (!clonedLeague) {
            continue;
        }

        if (oldLeague.promotesTo) {
            clonedLeague.promotesTo = leagueMap.get(oldLeague.promotesTo) ?? null;
            continue;
        }

        if (oldLeague.promotesToId !== undefined) {
            const oldPromotesToLeague = oldById.get(oldLeague.promotesToId);
            clonedLeague.promotesTo = oldPromotesToLeague ? leagueMap.get(oldPromotesToLeague) ?? null : null;
            continue;
        }

        clonedLeague.promotesTo = null;
    }
};

const getLowestDivisionLevel = (leagues: League[]): number => {
    if (leagues.length === 0) {
        return 0;
    }

    return Math.max(...leagues.map((league) => league.divisionLevel));
};

const getLeaguesOnDivision = (leagues: League[], divisionLevel: number): League[] => {
    return leagues
        .filter((league) => league.divisionLevel === divisionLevel)
        .sort((a, b) => a.serialNumberOnDivisionLevel - b.serialNumberOnDivisionLevel);
};

const getChildLeagues = (leagues: League[], parentLeague: League): League[] => {
    return leagues
        .filter((league) => league.promotesTo === parentLeague)
        .sort((a, b) => a.serialNumberOnDivisionLevel - b.serialNumberOnDivisionLevel);
};

const getLeagueClubs = (league: League): Club[] => {
    return league.clubs ?? [];
};

const cloneClub = (oldClub: Club): Club => {
    const clonedClub = new Club();
    clonedClub.id = oldClub.id;
    clonedClub.name = oldClub.name;
    clonedClub.passwordHash = oldClub.passwordHash;
    clonedClub.established = oldClub.established;
    clonedClub.zombie = oldClub.zombie;
    clonedClub.players = oldClub.players;
    clonedClub.leagues = oldClub.leagues;
    return clonedClub;
};


