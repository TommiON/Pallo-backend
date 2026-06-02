import jsonwebtoken from "jsonwebtoken";

import { authenticateLogin, generateToken } from "../authController";
import { findClubForAuthentication } from "../../dataAccess/authService";
import { passwordMatches } from "../controllerUtils";
import environment from "../../config/environment";

jest.mock("../../dataAccess/authService", () => ({
    findClubForAuthentication: jest.fn()
}));

jest.mock("../passwordUtils", () => ({
    passwordMatches: jest.fn()
}));

jest.mock("jsonwebtoken", () => ({
    __esModule: true,
    default: {
        sign: jest.fn()
    }
}));

describe("AuthController", () => {
    const findClubForAuthenticationMock = findClubForAuthentication as jest.Mock;
    const passwordMatchesMock = passwordMatches as jest.Mock;
    const signMock = jsonwebtoken.sign as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("authenticateLogin", () => {
        it("returns usernameFound=false when club is missing", async () => {
            findClubForAuthenticationMock.mockResolvedValue(null);

            const result = await authenticateLogin("Unknown FC", "secret");

            expect(findClubForAuthenticationMock).toHaveBeenCalledWith("Unknown FC");
            expect(passwordMatchesMock).not.toHaveBeenCalled();
            expect(result).toEqual({
                usernameFound: false,
                passwordMatches: undefined,
                authenticatedClubId: undefined,
                token: undefined
            });
        });

        it("returns passwordMatches=false when password does not match", async () => {
            findClubForAuthenticationMock.mockResolvedValue({
                id: 42,
                name: "FC Unit",
                passwordHash: "hashed"
            });
            passwordMatchesMock.mockResolvedValue(false);

            const result = await authenticateLogin("FC Unit", "wrong");

            expect(passwordMatchesMock).toHaveBeenCalledWith("wrong", "hashed");
            expect(signMock).not.toHaveBeenCalled();
            expect(result).toEqual({
                usernameFound: true,
                passwordMatches: false,
                authenticatedClubId: undefined,
                token: undefined
            });
        });

        it("returns authenticated result with token when credentials are valid", async () => {
            findClubForAuthenticationMock.mockResolvedValue({
                id: 42,
                name: "FC Unit",
                passwordHash: "hashed"
            });
            passwordMatchesMock.mockResolvedValue(true);
            signMock.mockReturnValue("signed-token");

            const result = await authenticateLogin("FC Unit", "secret");

            expect(passwordMatchesMock).toHaveBeenCalledWith("secret", "hashed");
            expect(signMock).toHaveBeenCalledWith({ clubName: "FC Unit", clubId: 42 }, environment.tokenSecret as string);
            expect(result).toEqual({
                usernameFound: true,
                passwordMatches: true,
                authenticatedClubId: 42,
                token: "signed-token"
            });
        });
    });

    describe("generateToken", () => {
        it("delegates to jsonwebtoken.sign", () => {
            signMock.mockReturnValue("generated-token");

            const result = generateToken({ clubName: "FC Unit", clubId: 42 });

            expect(signMock).toHaveBeenCalledWith({ clubName: "FC Unit", clubId: 42 }, environment.tokenSecret as string);
            expect(result).toBe("generated-token");
        });
    });
});
