import League from "../../domainModel/league/League";
import { LEAGUE_NUMBER_OF_TEAMS, LEAGUE_SPAN_FACTOR } from "../../domainProperties/domainProperties";

// Luodaan sen verran liigoja kuin saadaan täyteen, ylijäävät joutuvat odottamaan seuraavaa kautta. Muutetaan sitten kun saadaan zombiet toteutettua.
export const expandPyramid = (
    leagues: League[],
    clubsOnWaitingList: number[],
    season: number,
    leagueSpanFactor: number = LEAGUE_SPAN_FACTOR,
): League[] => {
    if (!Number.isInteger(leagueSpanFactor) || leagueSpanFactor < 1) {
        throw new Error("leagueSpanFactor must be a positive integer");
    }

    const resultLeagues = [...leagues];
    const clubChunksForNewLeagues: number[][] = sliceClubsForLeaguePlacement(clubsOnWaitingList);

    clubChunksForNewLeagues.forEach(clubChunk => {
        const leaguePosition = nextVacantPositionInPyramid(resultLeagues, leagueSpanFactor);
        const newLeague = new League(season, leaguePosition.divisionLevel, leaguePosition.serialNumberOnDivisionLevel, leaguePosition.parentLeague);
        newLeague.clubs = clubChunk.map(clubId => ({ id: clubId } as any));

        resultLeagues.push(newLeague);
    });

    return resultLeagues;
}

const sliceClubsForLeaguePlacement = (clubsOnWaitingList: number[]): number[][] => {
    const numberOfFullLeagues = Math.floor(clubsOnWaitingList.length / LEAGUE_NUMBER_OF_TEAMS);
    const clubsForLeaguePlacement = clubsOnWaitingList.slice(0, numberOfFullLeagues * LEAGUE_NUMBER_OF_TEAMS);

    const chunks: number[][] = [];

    for (let i = 0; i < clubsForLeaguePlacement.length; i += LEAGUE_NUMBER_OF_TEAMS) {
        chunks.push(clubsForLeaguePlacement.slice(i, i + LEAGUE_NUMBER_OF_TEAMS));
    }

    return chunks;
}

type PyramidPosition = {
    divisionLevel: number;
    serialNumberOnDivisionLevel: number;
    parentLeague: League | null;
}

const nextVacantPositionInPyramid = (leagues: League[], leagueSpanFactor: number): PyramidPosition => {
    if (leagues.length === 0) {
        // ei vielä yhtään liigaa, luodaan ensimmäinen
        return { 
            divisionLevel: 0, 
            serialNumberOnDivisionLevel: 0,
            parentLeague: null
        };
    }

    const parentCandidate: ParentInquiryResult = findFirstLeagueWithVacantChildPosition(leagues, leagueSpanFactor);
    
    if (parentCandidate.lowestLevelFullyOccupied) {
        // ei tilaa lapsille, luodaan uusi taso pyramidiin
        return {
            divisionLevel: parentCandidate.lowestDivisionLevel + 1,
            serialNumberOnDivisionLevel: 0,
            parentLeague: findFirstLeagueOnDivisionLevel(leagues, parentCandidate.lowestDivisionLevel)
        }
    } else {
        // luodaan lapsi vapaaseen kohtaan
        const childDivisionLevel = parentCandidate.identity!.divisionLevel + 1;

        return {
            divisionLevel: childDivisionLevel,
            serialNumberOnDivisionLevel: parentCandidate.highestExistingChildSerialNumber! + 1,
            parentLeague: parentCandidate.identity
        }
    }
}

type ParentInquiryResult = {
    lowestLevelFullyOccupied: boolean;
    lowestDivisionLevel: number;
    identity: League | null;
    highestExistingChildSerialNumber: number | null;
}

const findFirstLeagueWithVacantChildPosition = (leagues: League[], leagueSpanFactor: number): ParentInquiryResult => {
    const lowestDivisionLevel = findLowestPyramidLevel(leagues);

    const sortLeaguesByDivisionLevelAndSerialNumber = (a: League, b: League): number => {
        if (a.divisionLevel !== b.divisionLevel) {
            return a.divisionLevel - b.divisionLevel;
        } else {
            return a.serialNumberOnDivisionLevel - b.serialNumberOnDivisionLevel;
        }
    }

    const childCount = (league: League): number => {
        return leagues.filter(l => {
            if (l.promotesTo === league) {
                return true;
            }

            if (league.id === undefined) {
                return false;
            }

            return l.promotesToId === league.id;
        }).length;
    }

    const parentCandidate = [...leagues]
        .sort(sortLeaguesByDivisionLevelAndSerialNumber)
        .find(league => childCount(league) < leagueSpanFactor)

    return {
        lowestLevelFullyOccupied: parentCandidate === undefined,
        lowestDivisionLevel: lowestDivisionLevel,
        identity: parentCandidate ?? null,
        highestExistingChildSerialNumber: parentCandidate ? findBiggestSerialNumberOnDivisionLevel(leagues, parentCandidate.divisionLevel + 1) : null
    };
}

const findLowestPyramidLevel = (leagues: League[]): number => {
    return leagues.reduce((max, league) => Math.max(max, league.divisionLevel), 0);
}

// helper: finds the biggest serial number (of a rightmost occupied position) on a given division level, or 0 if no leagues on that level
const findBiggestSerialNumberOnDivisionLevel = (leagues: League[], divisionLevel: number): number => {
    const leaguesOnDivisionLevel = leagues.filter(league => league.divisionLevel === divisionLevel);

    if (leaguesOnDivisionLevel.length === 0) {
        return -1;
    }

    return leaguesOnDivisionLevel
        .reduce((max, league) => Math.max(max, league.serialNumberOnDivisionLevel), -1);
}

// helper: finds the first (leftmost, smallest serial number) league on a pyramid level
const findFirstLeagueOnDivisionLevel = (leagues: League[], divisionLevel: number): League | null => {
    return leagues.find(league => league.divisionLevel === divisionLevel) ?? null;
}



