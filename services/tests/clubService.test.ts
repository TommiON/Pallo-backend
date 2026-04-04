import Club from "../../domainModel/club/Club";
import { CLUB_NUMBER_OF_PLAYERS_AT_START } from "../../domainProperties/domainProperties";
import appDataSource from "../../config/datasource";
import { createClub } from "../clubService";
import { eventNotifications } from "../eventNotifications";
import { getTransactionalRepositories } from "../../persistence/repositories/repositories";

jest.mock("../../config/datasource", () => ({
    __esModule: true,
    default: {
        transaction: jest.fn()
    }
}));

jest.mock("../../persistence/repositories/repositories", () => ({
    clubRepository: {
        findOne: jest.fn(),
        findOneBy: jest.fn(),
        createQueryBuilder: jest.fn()
    },
    playerRepository: {
        save: jest.fn()
    },
    getTransactionalRepositories: jest.fn()
}));

jest.mock("../eventNotifications", () => ({
    eventNotifications: {
        emit: jest.fn()
    }
}));

describe("clubService.createClub", () => {
    const transactionMock = appDataSource.transaction as jest.Mock;
    const emitMock = eventNotifications.emit as jest.Mock;
    const getTransactionalRepositoriesMock = getTransactionalRepositories as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("creates club and players inside one transaction and emits after commit", async () => {
        const clubEntitySaveMock = jest.fn();
        const playerEntitySaveMock = jest.fn();

        const managerMock = {};

        transactionMock.mockImplementation(async (callback) => callback(managerMock));
        getTransactionalRepositoriesMock.mockReturnValue({
            clubRepository: { save: clubEntitySaveMock },
            playerRepository: { save: playerEntitySaveMock }
        });

        const clubToCreate = {
            toEntity: () => ({
                name: "Fc Unit",
                passwordHash: "hash",
                established: new Date("2026-01-01T00:00:00.000Z"),
                zombie: false
            })
        } as unknown as Club;

        jest.spyOn(Club, "create").mockResolvedValue(clubToCreate);

        const savedClubEntity = {
            id: 123,
            name: "Fc Unit",
            passwordHash: "hash",
            established: new Date("2026-01-01T00:00:00.000Z"),
            zombie: false
        };

        clubEntitySaveMock.mockResolvedValue(savedClubEntity);
        playerEntitySaveMock.mockResolvedValue([]);

        const result = await createClub("Fc Unit", "secret");

        expect(transactionMock).toHaveBeenCalledTimes(1);
        expect(clubEntitySaveMock).toHaveBeenCalledTimes(1);
        expect(playerEntitySaveMock).toHaveBeenCalledTimes(1);

        const savedPlayersArg = playerEntitySaveMock.mock.calls[0][0];
        expect(savedPlayersArg).toHaveLength(CLUB_NUMBER_OF_PLAYERS_AT_START);
        savedPlayersArg.forEach((playerEntity: any) => {
            expect(playerEntity.clubId).toBe(123);
        });

        expect(emitMock).toHaveBeenCalledTimes(1);
        expect(emitMock).toHaveBeenCalledWith("club.created", result);
        expect(result.id).toBe(123);
    });

    it("does not emit club.created when transaction fails", async () => {
        const clubEntitySaveMock = jest.fn();
        const playerEntitySaveMock = jest.fn();

        const managerMock = {};

        transactionMock.mockImplementation(async (callback) => callback(managerMock));
        getTransactionalRepositoriesMock.mockReturnValue({
            clubRepository: { save: clubEntitySaveMock },
            playerRepository: { save: playerEntitySaveMock }
        });

        const clubToCreate = {
            toEntity: () => ({
                name: "Fc Unit",
                passwordHash: "hash",
                established: new Date("2026-01-01T00:00:00.000Z"),
                zombie: false
            })
        } as unknown as Club;

        jest.spyOn(Club, "create").mockResolvedValue(clubToCreate);

        clubEntitySaveMock.mockResolvedValue({
            id: 123,
            name: "Fc Unit",
            passwordHash: "hash",
            established: new Date("2026-01-01T00:00:00.000Z"),
            zombie: false
        });
        playerEntitySaveMock.mockRejectedValue(new Error("player insert failed"));

        await expect(createClub("Fc Unit", "secret")).rejects.toThrow("player insert failed");
        expect(emitMock).not.toHaveBeenCalled();
    });
});
