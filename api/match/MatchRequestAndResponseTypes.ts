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
    eventType: string; // Replace 'string' with the appropriate type for the event type if needed
    minute: number; // Replace 'number' with the appropriate type for the minute if needed
};

export type MatchNaturePayload = {
    startMinute: number; //
    endMinute: number;
    possession: number; // Replace 'number' with the appropriate type for the possession if needed
};

