export type AuthClubRecord = {
    id: number;
    name: string;
    passwordHash: string;
};

export interface AuthStorePort {
    findClubForAuthentication(clubName: string): Promise<AuthClubRecord | null>;
}
