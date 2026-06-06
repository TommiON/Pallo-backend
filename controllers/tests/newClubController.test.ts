import { createNewUserClub } from "../../domainEngine/clubs/ClubCreator";
import { hashPassword } from "../controllerUtils";
import { persistNewClub } from "../../dataAccess/clubService";
import { newUserClub } from "../newClubController";

jest.mock("../../domainEngine/clubs/ClubCreator", () => ({
    createNewUserClub: jest.fn()
}));

jest.mock("../controllerUtils", () => ({
    hashPassword: jest.fn()
}));

jest.mock("../../dataAccess/clubService", () => ({
    persistNewClub: jest.fn()
}));

describe("newClubController", () => {
    const createNewUserClubMock = createNewUserClub as jest.Mock;
    const hashPasswordMock = hashPassword as jest.Mock;
    const persistNewClubMock = persistNewClub as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("creates club in domain, hashes password and persists the result", async () => {
        const createdClub = { club: { name: "FC Unit" }, players: [{ id: 1 }] };
        createNewUserClubMock.mockReturnValue(createdClub);
        hashPasswordMock.mockResolvedValue("hashed-password");
        persistNewClubMock.mockResolvedValue({ id: 123, name: "FC Unit" });

        const result = await newUserClub("FC Unit", "secret");

        expect(createNewUserClubMock).toHaveBeenCalledWith("FC Unit");
        expect(hashPasswordMock).toHaveBeenCalledWith("secret");
        expect(persistNewClubMock).toHaveBeenCalledWith({
            ...createdClub,
            passwordHash: "hashed-password"
        });
        expect(result).toEqual({ id: 123, name: "FC Unit" });
    });
});
