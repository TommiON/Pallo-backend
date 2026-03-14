import { Repository } from "typeorm";
import Time from "../../domainModel/time/Time";
import type { TimeEntityData } from "../../persistence/entities/TimeEntity";
import { getCurrentTime, initializeTime, advanceTime } from "../timeService";

jest.mock('../../persistence/repositories/repositories', () => ({
    timeRepository: {
        findOne: jest.fn(),
        save: jest.fn(),
    },
}));

import { timeRepository } from '../../persistence/repositories/repositories';

describe('timeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getCurrentTime', () => {
        it('should return the current time entity from database', async () => {
            // Given: a mock time entity in the database
            const mockTimeEntity: TimeEntityData = {
                id: 1,
                season: 1,
                week: 1,
                day: 1,
                hour: 12
            };
            
            (timeRepository.findOne as jest.Mock).mockResolvedValue(mockTimeEntity);

            // When: calling getCurrentTime
            const result = await getCurrentTime();

            // Then: should return the mock time entity
            expect(timeRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 }
            });

            expect(result).toEqual(mockTimeEntity);
        });

        it('should return null when no time exists in database', async () => {
            // Given: no time enrity in the database
            (timeRepository.findOne as jest.Mock).mockResolvedValue(null);

            // When: calling getCurrentTime
            const result = await getCurrentTime();

            // Then: should return null
            expect(timeRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 }
            });

            expect(result).toBeNull();
        });
    });

    describe('initializeTime', () => {
        it('should return existing time if already initialized', async () => {
            // Given: a time entity exists in the database
            const existingTimeEntity: TimeEntityData = {
                id: 1,
                season: 2,
                week: 5,
                day: 3,
                hour: 15
            };
            
            (timeRepository.findOne as jest.Mock).mockResolvedValue(existingTimeEntity);

            // When: calling initializeTime
            const result = await initializeTime();

            // Then: should return the existing time as a Time instance
            expect(timeRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(timeRepository.save).not.toHaveBeenCalled();
            expect(result).toBeInstanceOf(Time);
            expect(result.season).toBe(2);
            expect(result.week).toBe(5);
            expect(result.day).toBe(3);
            expect(result.hour).toBe(15);
        });

        it('should create and save new time if not initialized', async () => {
            // Given: no time entity exists in the database
            const newTimeEntity: TimeEntityData = {
                id: 1,
                season: 1,
                week: 1,
                day: 1,
                hour: 0
            };

            const savedTimeEntity: TimeEntityData = { ...newTimeEntity };

            (timeRepository.findOne as jest.Mock).mockResolvedValue(null);
            (timeRepository.save as jest.Mock).mockResolvedValue(savedTimeEntity);

            // When: calling initializeTime
            const result = await initializeTime();

            // Then: should save and return the new time
            expect(timeRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(timeRepository.save).toHaveBeenCalledWith(newTimeEntity);
            expect(result).toBeInstanceOf(Time);
            expect(result.season).toBe(1);
            expect(result.week).toBe(1);
            expect(result.day).toBe(1);
            expect(result.hour).toBe(0);
        });
    });

    describe('advanceTime', () => {
        // Integration tests that use real Time domain logic

        it('should advance time by one hour and save to database', async () => {
            // Given: an existing time entity in the database
            const initialTimeEntity: TimeEntityData = {
                id: 1,
                season: 1,
                week: 1,
                day: 1,
                hour: 10
            };

            (timeRepository.findOne as jest.Mock).mockResolvedValue(initialTimeEntity);
            (timeRepository.save as jest.Mock).mockImplementation((entity) => Promise.resolve(entity));

            // When: calling advanceTime
            const result = await advanceTime();

            // Then: repository is correctly called
            expect(timeRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 }
            });
            expect(timeRepository.save).toHaveBeenCalledTimes(1);
            const savedEntity = (timeRepository.save as jest.Mock).mock.calls[0][0];

            // And: the saved entity has the correct advanced time
            expect(savedEntity).toEqual({
                id: 1,
                season: 1,
                week: 1,
                day: 1,
                hour: 11
            });

            // And: the returned Time instance has correct time
            expect(result).toEqual(savedEntity);
        });

        it('should advance to next day when hour reaches 23', async () => {
            // Given: time at the end of a day
            const initialTimeEntity: TimeEntityData = {
                id: 1,
                season: 1,
                week: 1,
                day: 1,
                hour: 23
            };

            (timeRepository.findOne as jest.Mock).mockResolvedValue(initialTimeEntity);
            (timeRepository.save as jest.Mock).mockImplementation((entity) => Promise.resolve(entity));

            // When: calling advanceTime
            const result = await advanceTime();

            // Then: repository is correctly called
            expect(timeRepository.save).toHaveBeenCalledTimes(1);
            const savedEntity = (timeRepository.save as jest.Mock).mock.calls[0][0];

            // And: new time is correct
            expect(savedEntity).toEqual({
                id: 1,
                season: 1,
                week: 1,
                day: 2,
                hour: 0 
            });

            expect(result.day).toBe(2);
            expect(result.hour).toBe(0);
        });

        it('should adcance to next week when last day of a week over', async () => {
            // Given: time at the end of a week (day 7, hour 23)
            const initialTime: TimeEntityData = {
                id: 1,
                season: 1,
                week: 1,
                day: 7,
                hour: 23
            };

            (timeRepository.findOne as jest.Mock).mockResolvedValue(initialTime);
            (timeRepository.save as jest.Mock).mockImplementation((entity) => Promise.resolve(entity));

            // When: calling advanceTime
            const result = await advanceTime();

            // Then: repository is correctly called
            expect(timeRepository.save).toHaveBeenCalledTimes(1);
            const savedEntity = (timeRepository.save as jest.Mock).mock.calls[0][0];

            // And: new time is correct
            expect(savedEntity).toEqual({
                id: 1,
                season: 1,
                week: 2,
                day: 1,
                hour: 0
            });

            expect(result.week).toBe(2);
            expect(result.day).toBe(1);
            expect(result.hour).toBe(0);
        });

        it('should notify registered listeners when time advances', async () => {
            // Given: time entity and a registered listener
            const initialTimeEntity: TimeEntityData = {
                id: 1,
                season: 1,
                week: 1,
                day: 1,
                hour: 10
            };

            (timeRepository.findOne as jest.Mock).mockResolvedValue(initialTimeEntity);
            (timeRepository.save as jest.Mock).mockImplementation((entity) => Promise.resolve(entity));

            const listenerMock = jest.fn();
            const timeInstance = Time.fromEntity(initialTimeEntity);
            timeInstance.registerChangeListener(listenerMock);

            // When: calling advanceTime
            await advanceTime();

            // Then: the listener was called with the advanced time
            expect(listenerMock).toHaveBeenCalledTimes(1);
            const notifiedTime = listenerMock.mock.calls[0][0];
            expect(notifiedTime).toBeInstanceOf(Time);
            expect(notifiedTime.hour).toBe(11);
            expect(notifiedTime.day).toBe(1);
            expect(notifiedTime.week).toBe(1);
            expect(notifiedTime.season).toBe(1);
        });
    });
});
