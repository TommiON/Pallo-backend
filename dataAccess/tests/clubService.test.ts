import Club from "../../domainCore/Club";
import Player from "../../domainCore/Player";
import { ClubEntity } from "../../persistence/entities/ClubEntity";
import { PlayerEntity } from "../../persistence/entities/PlayerEntity";
import {
    defaultClubEventsPort,
    defaultClubStorePort,
    defaultClubTransactionPort
} from "../../persistence/adapters/clubAdapters";
import { CLUB_NUMBER_OF_PLAYERS_AT_START } from "../../domainCore/domainProperties";
import appDataSource from "../../config/datasource";
import { configureClubService, persistNewClub } from "../clubService";
import { eventNotifications } from "../eventNotifications";

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
        save: jest.fn(),
        find: jest.fn()
    }
}));

jest.mock("../eventNotifications", () => ({
    eventNotifications: {
        emit: jest.fn()
    }
}));

describe("clubService.persistNewClub", () => {
    const transactionMock = appDataSource.transaction as jest.Mock;
    const emitMock = eventNotifications.emit as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        configureClubService({
            clubStore: defaultClubStorePort,
            clubTransaction: defaultClubTransactionPort,
            clubEvents: defaultClubEventsPort
        });
    });

    const createNewClubInput = () => {
        const club = new Club("Fc Unit");
        const players: Player[] = [];

        for (let i = 0; i < CLUB_NUMBER_OF_PLAYERS_AT_START; i++) {
            const player = new Player();
            player.club = club;
            players.push(player);
        }

        return { club, players };
    };

    it("creates club and players inside one transaction and emits after commit", async () => {
        const clubEntitySaveMock = jest.fn();
        const playerEntitySaveMock = jest.fn();

        const managerMock = {
            getRepository: jest.fn((entity: unknown) => {
                if (entity === ClubEntity) {
                    return { save: clubEntitySaveMock };
                }

                if (entity === PlayerEntity) {
                    return { save: playerEntitySaveMock };
                }

                throw new Error("Unexpected repository request");
            })
        };

        transactionMock.mockImplementation(async (callback) => callback(managerMock));

        const newClub = createNewClubInput();
        newClub.club.established = new Date("2026-01-01T00:00:00.000Z");
        newClub.club.zombie = false;

        const savedClubEntity = {
            id: 123,
            name: "Fc Unit",
            passwordHash: "hash",
            established: new Date("2026-01-01T00:00:00.000Z"),
            zombie: false
        };

        clubEntitySaveMock.mockResolvedValue(savedClubEntity);
        playerEntitySaveMock.mockResolvedValue([]);

        const result = await persistNewClub({
            ...newClub,
            passwordHash: "hash"
        });

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

        const managerMock = {
            getRepository: jest.fn((entity: unknown) => {
                if (entity === ClubEntity) {
                    return { save: clubEntitySaveMock };
                }

                if (entity === PlayerEntity) {
                    return { save: playerEntitySaveMock };
                }

                throw new Error("Unexpected repository request");
            })
        };

        transactionMock.mockImplementation(async (callback) => callback(managerMock));

        const newClub = createNewClubInput();
        newClub.club.established = new Date("2026-01-01T00:00:00.000Z");
        newClub.club.zombie = false;

        clubEntitySaveMock.mockResolvedValue({
            id: 123,
            name: "Fc Unit",
            passwordHash: "hash",
            established: new Date("2026-01-01T00:00:00.000Z"),
            zombie: false
        });
        playerEntitySaveMock.mockRejectedValue(new Error("player insert failed"));

        await expect(persistNewClub({
            ...newClub,
            passwordHash: "hash"
        })).rejects.toThrow("player insert failed");
        expect(emitMock).not.toHaveBeenCalled();
    });
});
