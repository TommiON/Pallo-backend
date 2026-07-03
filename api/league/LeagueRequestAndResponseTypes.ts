import { LeagueData } from "../../domainCore/League";

export type LeagueByIdRequest = {
    id: number;
}

export type LeagueByIdResponse = LeagueData | null;

// divisionLevel and serialNumberOnDivisionLevel are optional, but validation will ensure that if one is provided, the other must also be provided
// vai mahtaisiko olla tarvetta hakea tiettyä divaritaso?
export type LeagueByQueryRequest = {
    season: number;
    divisionLevel?: number;
    serialNumberOnDivisionLevel?: number;
}

export type LeaguesByQueryResponse = LeagueData[] | null;