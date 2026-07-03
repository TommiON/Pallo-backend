import { LeagueData } from "../../domainCore/League";

export type LeagueByIdRequest = {
    id: number;
}

// divisionLevel and serialNumberOnDivisionLevel are optional, but validation will ensure that if one is provided, the other must also be provided
// vai mahtaisiko olla tarvetta hakea tiettyä divaritaso?
export type LeagueByQueryRequest = {
    season: number;
    divisionLevel?: number;
    serialNumberOnDivisionLevel?: number;
}

export type LeaguePayload = {
    id: number;
    season: number;
    divisionLevel: number;
    serialNumberOnDivisionLevel: number;
    started: boolean;
    finished: boolean;
    promotesToId: number | null;
    clubs: {
        id: number;
        name: string;
        zombie: boolean;
    }[];
    fixtures: {
        id: number;
        week: number;
        started: boolean;
        finished: boolean;
        homeClubId: number;
        homeClubName: string;
        awayClubId: number;
        awayClubName: string;
    }[];
}

export type LeagueByIdResponse = LeaguePayload | null;

export type LeaguesByQueryResponse = LeaguePayload[] | null;