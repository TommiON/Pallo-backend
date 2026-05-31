import { createAuthService } from "../authService";
import type { AuthClubRecord } from "../ports/authPorts";

describe("authService", () => {
    it("delegates club lookup to authStore and returns found club", async () => {
        const foundClub: AuthClubRecord = {
            id: 7,
            name: "FC Unit",
            passwordHash: "hashed"
        };

        const authStore = {
            findClubForAuthentication: jest.fn().mockResolvedValue(foundClub)
        };

        const authService = createAuthService({ authStore });
        const result = await authService.findClubForAuthentication("FC Unit");

        expect(authStore.findClubForAuthentication).toHaveBeenCalledWith("FC Unit");
        expect(result).toEqual(foundClub);
    });

    it("delegates club lookup to authStore and returns null when missing", async () => {
        const authStore = {
            findClubForAuthentication: jest.fn().mockResolvedValue(null)
        };

        const authService = createAuthService({ authStore });
        const result = await authService.findClubForAuthentication("Unknown FC");

        expect(authStore.findClubForAuthentication).toHaveBeenCalledWith("Unknown FC");
        expect(result).toBeNull();
    });
});
