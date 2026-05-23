import League from "../../domainModel/league/League";
import { LEAGUE_NUMBER_OF_TEAMS, LEAGUE_SPAN_FACTOR } from "../../domainProperties/domainProperties";

// Luodaan sen verran liigoja kuin saadaan täyteen, ylijäävät joutuvat odottamaan seuraavaa kautta. Muutetaan sitten kun saadaan zombiet toteutettua.
export const expandPyramid = (leagues: League[], clubsOnWaitingList: number[], season: number): League[] => {
    // lasketaan moneenko uuteen liigaan riittää odottajia
    const clubChunksForNewLeagues: number[][] = sliceClubsForLeaguePlacement(clubsOnWaitingList);

    // generoitu, tarkista ajatuksella
    clubChunksForNewLeagues.forEach(clubChunk => {
        const vacantPosition = nextVacantPositionInPyramid(leagues);
        const parentLeague = vacantPosition.divisionLevel > 0 ? findFirstLeagueWithVacantChildPosition(leagues) : null;

        const newLeague = new League(season, vacantPosition.divisionLevel, vacantPosition.serialNumberOnDivisionLevel, parentLeague);
        newLeague.clubs = clubChunk.map(clubId => ({ id: clubId } as any));

        // toimiiko näin, pushataan sisääntulevaan, lopulta palauetetaan?
        leagues.push(newLeague);
    });

    // placeholder
    return leagues;
}

type PyramidPosition = {
    divisionLevel: number;
    serialNumberOnDivisionLevel: number;
    parentLeague: League | null;
}

const nextVacantPositionInPyramid = (leagues: League[]): PyramidPosition => {
    if (leagues.length === 0) {
        // ei vielä yhtään liigaa, luodaan ensimmäinen
        return { 
            divisionLevel: 0, 
            serialNumberOnDivisionLevel: 0,
            parentLeague: null
        };
    }

    const parent = findFirstLeagueWithVacantChildPosition(leagues);

    if (parent) {
        return {
            divisionLevel: parent.divisionLevel + 1, 
            serialNumberOnDivisionLevel: 0,
            parentLeague: parent
        };
    }

    const lowestDivisionLevel = findLowestDivionLevel(leagues);

    if (isCapacityLeftOnDivisionLevel(leagues, lowestDivisionLevel)) {
        return { 
            divisionLevel: lowestDivisionLevel, 
            serialNumberOnDivisionLevel: findHighestSerialNumberOnDivisionLevel(leagues, lowestDivisionLevel) + 1 
        };
    } else {
        return {
            divisionLevel: lowestDivisionLevel + 1, 
            serialNumberOnDivisionLevel: 0 
        };
    }
}

type ParentInquiryResult = {
    lowestLevelFullyOccupied: boolean;
    lowestDivisionLevel: number;
    parent: League | null;
    highestExistingChildSerialNumber: number | null;
}

const findFirstLeagueWithVacantChildPosition = (leagues: League[]): ParentInquiryResult => {
    const lowestDivisionLevel = findLowestDivionLevel(leagues);

    const sortLeaguesByDivisionLevelAndSerialNumber = (a: League, b: League): number => {
        if (a.divisionLevel !== b.divisionLevel) {
            return a.divisionLevel - b.divisionLevel;
        } else {
            return a.serialNumberOnDivisionLevel - b.serialNumberOnDivisionLevel;
        }
    }

    const childCount = (league: League): number => leagues.filter(l => l.promotesToId === league.id).length;

    const parentCandidate = leagues
        .sort(sortLeaguesByDivisionLevelAndSerialNumber)
        .find(league => league.id !== undefined && childCount(league) < LEAGUE_SPAN_FACTOR)

    return {
        lowestLevelFullyOccupied: parentCandidate === undefined,
        lowestDivisionLevel,
        parent: parentCandidate ?? null,
        highestExistingChildSerialNumber: parentCandidate ? findHighestSerialNumberOnDivisionLevel(leagues, parentCandidate.divisionLevel + 1) : null
    };
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

const addLeagueToPyramid = (newLeague: League, fromParent: League | null, clubs: number[],existingLeagues: League[]): void => {

}

const findLowestDivionLevel = (leagues: League[]): number => {
    return leagues.reduce((max, league) => Math.max(max, league.divisionLevel), 0);
}

const findHighestSerialNumberOnDivisionLevel = (leagues: League[], divisionLevel: number): number => {
    return leagues.filter(league => league.divisionLevel === divisionLevel)
        .reduce((max, league) => Math.max(max, league.serialNumberOnDivisionLevel), 0);
}

const isCapacityLeftOnDivisionLevel = (leagues: League[], divisionLevel: number): boolean => { 
    const capacityOfDivisionLevel = Math.pow(LEAGUE_SPAN_FACTOR, divisionLevel);
    return findHighestSerialNumberOnDivisionLevel(leagues, divisionLevel) < capacityOfDivisionLevel;    
}




