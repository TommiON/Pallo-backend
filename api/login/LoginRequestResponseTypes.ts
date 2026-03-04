export type LoginRequest = {
    clubName: string;
    password: string;
};

export type LoginResponse = {
    token: string;
    clubId: number;
    clubName: string;
};