import Club from "../../domainCore/Club";
import League from "../../domainCore/League";
import Match from "../../domainCore/Match";
import MatchEvent from "../../domainCore/MatchEvent";
import {
    createMatchEventService,
    findMatchEventById,
    findMatchEventsByMatchId,
    saveMatchEvent,
    saveMatchEventsInBatch
} from "../matchEventService";

describe("matchEventService", () => {
    const createMatchFixture = (id: number): Match => {
        const home = new Club(`Home ${id}`);
        home.id = id * 10 + 1;

        const away = new Club(`Away ${id}`);
        away.id = id * 10 + 2;

        const league = new League(1, 1, 1, null);
        league.id = 100;

        const match = new Match(home, away, 3, league);
        match.id = id;
        return match;
    };

    const createMatchEventFixture = (id: number, matchId: number): MatchEvent => {
        const match = createMatchFixture(matchId);
        const event = new MatchEvent("goal", 12, "home");
        event.id = id;
        event.match = match;
        return event;
    };

    describe("delegation", () => {
        it("delegates saveMatchEvent to matchEventStore.save", async () => {
            const matchEvent = createMatchEventFixture(1, 1000);
            const matchEventStore = {
                save: jest.fn().mockResolvedValue(matchEvent),
                findById: jest.fn(),
                findByMatchId: jest.fn()
            };
            const matchEventTransaction = {
                runInTransaction: jest.fn()
            };

            const service = createMatchEventService({ matchEventStore, matchEventTransaction });
            const result = await service.saveMatchEvent(matchEvent);

            expect(matchEventStore.save).toHaveBeenCalledWith(matchEvent);
            expect(result).toBe(matchEvent);
        });

        it("delegates findMatchEventById to matchEventStore.findById", async () => {
            const matchEvent = createMatchEventFixture(1, 1000);
            const matchEventStore = {
                save: jest.fn(),
                findById: jest.fn().mockResolvedValue(matchEvent),
                findByMatchId: jest.fn()
            };
            const matchEventTransaction = {
                runInTransaction: jest.fn()
            };

            const service = createMatchEventService({ matchEventStore, matchEventTransaction });
            const result = await service.findMatchEventById(1);

            expect(matchEventStore.findById).toHaveBeenCalledWith(1);
            expect(result).toBe(matchEvent);
        });

        it("delegates findMatchEventsByMatchId to matchEventStore.findByMatchId", async () => {
            const matchEvents = [
                createMatchEventFixture(1, 1000),
                createMatchEventFixture(2, 1000)
            ];
            const matchEventStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByMatchId: jest.fn().mockResolvedValue(matchEvents)
            };
            const matchEventTransaction = {
                runInTransaction: jest.fn()
            };

            const service = createMatchEventService({ matchEventStore, matchEventTransaction });
            const result = await service.findMatchEventsByMatchId(1000);

            expect(matchEventStore.findByMatchId).toHaveBeenCalledWith(1000);
            expect(result).toBe(matchEvents);
        });

        it("delegates saveMatchEventsInBatch to transaction store saveMatchEvents", async () => {
            const matchEvents = [
                createMatchEventFixture(1, 1000),
                createMatchEventFixture(2, 1000)
            ];

            const matchEventStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByMatchId: jest.fn()
            };

            const transactionalStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByMatchId: jest.fn(),
                saveMatchEvents: jest.fn().mockResolvedValue(undefined)
            };

            const matchEventTransaction = {
                runInTransaction: jest.fn().mockImplementation(async (operation) => operation(transactionalStore))
            };

            const service = createMatchEventService({ matchEventStore, matchEventTransaction });
            await service.saveMatchEventsInBatch(matchEvents);

            expect(matchEventTransaction.runInTransaction).toHaveBeenCalledTimes(1);
            expect(transactionalStore.saveMatchEvents).toHaveBeenCalledWith(matchEvents);
        });
    });

    describe("transaction behavior contract", () => {
        it("runs batch save through transaction-scoped store", async () => {
            const matchEvents = [
                createMatchEventFixture(1, 1000),
                createMatchEventFixture(2, 1000)
            ];

            const matchEventStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByMatchId: jest.fn()
            };

            const transactionalStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByMatchId: jest.fn(),
                saveMatchEvents: jest.fn().mockResolvedValue(undefined)
            };

            const matchEventTransaction = {
                runInTransaction: jest.fn().mockImplementation(async (operation) => operation(transactionalStore))
            };

            const service = createMatchEventService({ matchEventStore, matchEventTransaction });
            await service.saveMatchEventsInBatch(matchEvents);

            expect(matchEventTransaction.runInTransaction).toHaveBeenCalledTimes(1);
            expect(transactionalStore.saveMatchEvents).toHaveBeenCalledTimes(1);
            expect(matchEventStore.save).not.toHaveBeenCalled();
        });

        it("uses transaction path for empty batch", async () => {
            const matchEventStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByMatchId: jest.fn()
            };

            const transactionalStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByMatchId: jest.fn(),
                saveMatchEvents: jest.fn().mockResolvedValue(undefined)
            };

            const matchEventTransaction = {
                runInTransaction: jest.fn().mockImplementation(async (operation) => operation(transactionalStore))
            };

            const service = createMatchEventService({ matchEventStore, matchEventTransaction });
            await service.saveMatchEventsInBatch([]);

            expect(matchEventTransaction.runInTransaction).toHaveBeenCalledTimes(1);
            expect(transactionalStore.saveMatchEvents).toHaveBeenCalledWith([]);
        });
    });

    describe("error conditions", () => {
        it("propagates errors from matchEventStore.save", async () => {
            const matchEvent = createMatchEventFixture(1, 1000);
            const matchEventStore = {
                save: jest.fn().mockRejectedValue(new Error("save failed")),
                findById: jest.fn(),
                findByMatchId: jest.fn()
            };
            const matchEventTransaction = {
                runInTransaction: jest.fn()
            };

            const service = createMatchEventService({ matchEventStore, matchEventTransaction });

            await expect(service.saveMatchEvent(matchEvent)).rejects.toThrow("save failed");
            expect(matchEventStore.save).toHaveBeenCalledWith(matchEvent);
        });

        it("propagates errors when transactional saveMatchEvents fails", async () => {
            const matchEvents = [
                createMatchEventFixture(1, 1000),
                createMatchEventFixture(2, 1000)
            ];

            const matchEventStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByMatchId: jest.fn()
            };

            const transactionalStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByMatchId: jest.fn(),
                saveMatchEvents: jest.fn().mockRejectedValue(new Error("batch save failed"))
            };

            const matchEventTransaction = {
                runInTransaction: jest.fn().mockImplementation(async (operation) => operation(transactionalStore))
            };

            const service = createMatchEventService({ matchEventStore, matchEventTransaction });
            await expect(service.saveMatchEventsInBatch(matchEvents)).rejects.toThrow("batch save failed");
            expect(matchEventTransaction.runInTransaction).toHaveBeenCalledTimes(1);
        });

        it("propagates errors from matchEventTransaction.runInTransaction", async () => {
            const matchEventStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByMatchId: jest.fn()
            };

            const matchEventTransaction = {
                runInTransaction: jest.fn().mockRejectedValue(new Error("transaction failed"))
            };

            const service = createMatchEventService({ matchEventStore, matchEventTransaction });
            await expect(service.saveMatchEventsInBatch([createMatchEventFixture(1, 1000)])).rejects.toThrow("transaction failed");
            expect(matchEventTransaction.runInTransaction).toHaveBeenCalledTimes(1);
        });
    });

    describe("configuration guard", () => {
        it("throws when saveMatchEvent is called before configureMatchEventService", async () => {
            await expect(saveMatchEvent(createMatchEventFixture(1, 1000))).rejects.toThrow("MatchEventService has not been configured.");
        });

        it("throws when saveMatchEventsInBatch is called before configureMatchEventService", async () => {
            await expect(saveMatchEventsInBatch([createMatchEventFixture(1, 1000)])).rejects.toThrow("MatchEventService has not been configured.");
        });

        it("throws when query functions are called before configureMatchEventService", async () => {
            await expect(findMatchEventById(1)).rejects.toThrow("MatchEventService has not been configured.");
            await expect(findMatchEventsByMatchId(1000)).rejects.toThrow("MatchEventService has not been configured.");
        });
    });
});
