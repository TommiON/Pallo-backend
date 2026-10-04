export type MatchReportByIdRequest = {
    id: string;
};

export type MatchReportResponse = {
    matchId: number;
    homeTeam: string;
    homeTeamId: number;
    awayTeam: string;
    awayTeamId: number;
    phases: MatchNaturePayload[];
    events: MatchEventPayload[];
};

export type MatchEventPayload = {
    eventType: string;
    initiator: string;
    minute: number;
};

export type MatchNaturePayload = {
    startMinute: number; //
    endMinute: number;
    homePossession: {
        homeDefenceLeft: number;
        homeDefenceCenter: number;
        homeDefenceRight: number;
        midfield: number;
        homeAttackLeft: number;
        homeAttackCenter: number;
        homeAttackRight: number;
    }
    balance: {
        homeDefenceLeft: number;
        homeDefenceCenter: number;
        homeDefenceRight: number;
        midfield: number;
        homeAttackLeft: number;
        homeAttackCenter: number;
        homeAttackRight: number;
    }
};

