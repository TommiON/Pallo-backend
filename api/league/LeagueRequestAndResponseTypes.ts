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

export type LeagueByIdResponse = LeaguePayload | null;

export type LeaguesByQueryResponse = LeaguePayload[] | null;

export type LeaguePayload = {
    id: number;
    season: number;
    divisionLevel: number;
    serialNumberOnDivisionLevel: number;
    started: boolean;
    finished: boolean;
    promotesToId: number | null;
    clubs: ClubPayload[];
    // Fixtures are categorized into played, ongoing, and unplayed; mapper returns highest week first for played, lowest for unplayed
    fixtures: {
        played: FixturePayload[];
        ongoing: FixturePayload[];
        unplayed: FixturePayload[];
    };
    // Standings are returned in week-chunks, highest week first
    standings: StandingsWeekPayload[];
}

type ClubPayload = {
    id: number;
    name: string;
    zombie: boolean;
}

type FixturePayload = {
    id: number;
    week: number;
    started: boolean;
    finished: boolean;
    homeClubId: number;
    homeClubName: string;
    awayClubId: number;
    awayClubName: string;
}

type StandingPayload = {
    clubId: number;
    clubName: string;
    week: number;
    points: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
}

type StandingsWeekPayload = {
    week: number;
    standings: StandingPayload[];
}

