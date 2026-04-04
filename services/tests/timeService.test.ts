import Time from "../../domainModel/time/Time";
import appDataSource from "../../config/datasource";
import type { TimeEntityData } from "../../persistence/entities/TimeEntity";
import { getTransactionalRepositories, timeRepository } from "../../persistence/repositories/repositories";
import { getCurrentTime, initializeTime, advanceTime } from "../timeService";
import { eventNotifications } from "../eventNotifications";

jest.mock("../../config/datasource", () => ({
    __esModule: true,
    default: {
        transaction: jest.fn()
    }
}));

jest.mock("../../persistence/repositories/repositories", () => ({
    timeRepository: {
        findOne: jest.fn()
    },
    getTransactionalRepositories: jest.fn()
}));

jest.mock("../eventNotifications", () => ({
    eventNotifications: {
        emit: jest.fn()
    }
}));

describe("timeService", () => {
    const transactionMock = appDataSource.transaction as jest.Mock;
    const getTransactionalRepositoriesMock = getTransactionalRepositories as jest.Mock;
    const emitMock = eventNotifications.emit as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getCurrentTime", () => {
        it("should return current time from the repository", async () => {
            const mockTimeEntity: TimeEntityData = {
                id: 1,
                season: 1,
                week: 1,
                day: 1,
                hour: 12
            };

            (timeRepository.findOne as jest.Mock).mockResolvedValue(mockTimeEntity);

            const result = await getCurrentTime();

            expect(timeRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(result).toBeInstanceOf(Time);
            expect(result?.hour).toBe(12);
        });

        it("should return null when singleton row does not exist", async () => {
            (timeRepository.findOne as jest.Mock).mockResolvedValue(null);

            const result = await getCurrentTime();

            expect(timeRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(result).toBeNull();
        });
    });

    describe("initializeTime", () => {
        it("should return existing locked singleton when already initialized", async () => {
            const existingTimeEntity: TimeEntityData = {
                id: 1,
                season: 2,
                week: 5,
                day: 3,
                hour: 15
            };

            const selectQueryBuilderMock = {
                setLock: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(existingTimeEntity)
            };

            const insertQueryBuilderMock = {
                insert: jest.fn().mockReturnThis(),
                into: jest.fn().mockReturnThis(),
                values: jest.fn().mockReturnThis(),
                orIgnore: jest.fn().mockReturnThis(),
                execute: jest.fn().mockResolvedValue(undefined)
            };

            const transactionalTimeRepositoryMock = {
                createQueryBuilder: jest.fn((alias?: string) => alias ? selectQueryBuilderMock : insertQueryBuilderMock)
            };

            const managerMock = {};
            transactionMock.mockImplementation(async (callback) => callback(managerMock));
            getTransactionalRepositoriesMock.mockReturnValue({
                timeRepository: transactionalTimeRepositoryMock
            });

            const result = await initializeTime();

            expect(transactionMock).toHaveBeenCalledTimes(1);
            expect(selectQueryBuilderMock.getOne).toHaveBeenCalledTimes(1);
            expect(insertQueryBuilderMock.execute).not.toHaveBeenCalled();
            expect(emitMock).toHaveBeenCalledTimes(1);
            expect(result).toBeInstanceOf(Time);
            expect(result.season).toBe(2);
            expect(result.week).toBe(5);
            expect(result.day).toBe(3);
            expect(result.hour).toBe(15);
        });

        it("should insert singleton when missing and then return it", async () => {
            const initializedTimeEntity: TimeEntityData = {
                id: 1,
                season: 1,
                week: 1,
                day: 1,
                hour: 0
            };

            const selectQueryBuilderMock = {
                setLock: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn()
                    .mockResolvedValueOnce(null)
                    .mockResolvedValueOnce(initializedTimeEntity)
            };

            const insertQueryBuilderMock = {
                insert: jest.fn().mockReturnThis(),
                into: jest.fn().mockReturnThis(),
                values: jest.fn().mockReturnThis(),
                orIgnore: jest.fn().mockReturnThis(),
                execute: jest.fn().mockResolvedValue(undefined)
            };

            const transactionalTimeRepositoryMock = {
                createQueryBuilder: jest.fn((alias?: string) => alias ? selectQueryBuilderMock : insertQueryBuilderMock)
            };

            const managerMock = {};
            transactionMock.mockImplementation(async (callback) => callback(managerMock));
            getTransactionalRepositoriesMock.mockReturnValue({
                timeRepository: transactionalTimeRepositoryMock
            });

            const result = await initializeTime();

            expect(selectQueryBuilderMock.getOne).toHaveBeenCalledTimes(2);
            expect(insertQueryBuilderMock.execute).toHaveBeenCalledTimes(1);
            expect(emitMock).toHaveBeenCalledTimes(1);
            expect(result).toBeInstanceOf(Time);
            expect(result.hour).toBe(0);
        });
    });

    describe("advanceTime", () => {
        it("should lock singleton, advance one hour and save", async () => {
            const initialTimeEntity: TimeEntityData = {
                id: 1,
                season: 1,
                week: 1,
                day: 1,
                hour: 10
            };

            const selectQueryBuilderMock = {
                setLock: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(initialTimeEntity)
            };

            const transactionalTimeRepositoryMock = {
                createQueryBuilder: jest.fn().mockReturnValue(selectQueryBuilderMock),
                save: jest.fn().mockImplementation((entity) => Promise.resolve(entity))
            };

            const managerMock = {};
            transactionMock.mockImplementation(async (callback) => callback(managerMock));
            getTransactionalRepositoriesMock.mockReturnValue({
                timeRepository: transactionalTimeRepositoryMock
            });

            const result = await advanceTime();

            expect(transactionMock).toHaveBeenCalledTimes(1);
            expect(selectQueryBuilderMock.getOne).toHaveBeenCalledTimes(1);
            expect(transactionalTimeRepositoryMock.save).toHaveBeenCalledTimes(1);

            const savedEntity = transactionalTimeRepositoryMock.save.mock.calls[0][0];
            expect(savedEntity).toEqual({
                id: 1,
                season: 1,
                week: 1,
                day: 1,
                hour: 11
            });

            expect(result).toBeInstanceOf(Time);
            expect(result.hour).toBe(11);
            expect(emitMock).toHaveBeenCalledTimes(1);
        });

        it("should throw if singleton does not exist", async () => {
            const selectQueryBuilderMock = {
                setLock: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(null)
            };

            const transactionalTimeRepositoryMock = {
                createQueryBuilder: jest.fn().mockReturnValue(selectQueryBuilderMock),
                save: jest.fn()
            };

            const managerMock = {};
            transactionMock.mockImplementation(async (callback) => callback(managerMock));
            getTransactionalRepositoriesMock.mockReturnValue({
                timeRepository: transactionalTimeRepositoryMock
            });

            await expect(advanceTime()).rejects.toThrow("Time not initialized");
            expect(transactionalTimeRepositoryMock.save).not.toHaveBeenCalled();
            expect(emitMock).not.toHaveBeenCalled();
        });
    });
});
