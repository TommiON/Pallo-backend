import League from "../../domainModel/league/League";
import { LEAGUE_PROMOTED_FROM_TOP } from "../../domainProperties/domainProperties"

type LeaguePyramid = {
    [divisionLevel: number]: {
        [serialNumberOnDivisionLevel: number]: League
    }
}

export const promoteAndRelegate = async (oldLeagues: League[]): Promise<League[]> => {
    const pyramid = makeIntoAPyramid(oldLeagues);
    console.log('Pyramidi:', pyramid);
    console.log('Alin leveli', getLowestDivisionLevel(pyramid));
    
    return oldLeagues; // placeholder
}

const makeIntoAPyramid = (leagues: League[]): LeaguePyramid => {
    const pyramid: LeaguePyramid = {};

    for (const league of leagues) {
        if (!pyramid[league.divisionLevel]) {
            pyramid[league.divisionLevel] = {};
        }
        pyramid[league.divisionLevel][league.serialNumberOnDivisionLevel] = league;
    }

    return pyramid;
}

const getLowestDivisionLevel = (pyramid: LeaguePyramid): number => {
    return Math.max(...Object.keys(pyramid).map(level => Number(level)));
}
