import { LeagueData } from "../../domainCore/League";

export type LeagueBySeasonRequest = {
    season: number;
}

export type LeaguesBySeasonResponse = LeagueData[] | null;