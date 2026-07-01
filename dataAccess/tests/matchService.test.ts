import Club from "../../domainCore/Club";
import League from "../../domainCore/League";
import Match from "../../domainCore/Match";
import {
    createMatchService,
    findMatchById,
    findMatchesByLeagueId,
    findMatchesByLeagueIdAndWeek,
    saveMatch,
    saveMatchesInBatch
} from "../matchService";

describe("matchService delegation", () => {
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

    it("delegates saveMatch to matchStore.save", async () => {
        const match = createMatchFixture(1);
        const matchStore = {
            save: jest.fn().mockResolvedValue(match),
            findById: jest.fn(),
            findByLeagueId: jest.fn(),
            findByLeagueIdAndWeek: jest.fn(),
            findByLeagueIdAndRound: jest.fn()
        };
        const matchTransaction = {
            runInTransaction: jest.fn()
        };

        const matchService = createMatchService({ matchStore, matchTransaction });
        const result = await matchService.saveMatch(match);

        expect(matchStore.save).toHaveBeenCalledWith(match);
        expect(result).toBe(match);
    });

    it("delegates saveMatchesInBatch to matchTransaction.runInTransaction and transactional saveMatches", async () => {
        const matches = [createMatchFixture(1), createMatchFixture(2)];
        const matchStore = {
            save: jest.fn(),
            findById: jest.fn(),
            findByLeagueId: jest.fn(),
            findByLeagueIdAndWeek: jest.fn(),
            findByLeagueIdAndRound: jest.fn()
        };

        const transactionalStore = {
            save: jest.fn(),
            findById: jest.fn(),
            findByLeagueId: jest.fn(),
            findByLeagueIdAndWeek: jest.fn(),
            findByLeagueIdAndRound: jest.fn(),
            saveMatches: jest.fn().mockResolvedValue(undefined)
        };

        const matchTransaction = {
            runInTransaction: jest.fn().mockImplementation(async (operation) => operation(transactionalStore))
        };

        const matchService = createMatchService({ matchStore, matchTransaction });
        await matchService.saveMatchesInBatch(matches);

        expect(matchTransaction.runInTransaction).toHaveBeenCalledTimes(1);
        expect(transactionalStore.saveMatches).toHaveBeenCalledWith(matches);
    });

    it("delegates findMatchById to matchStore.findById", async () => {
        const match = createMatchFixture(1);
        const matchStore = {
            save: jest.fn(),
            findById: jest.fn().mockResolvedValue(match),
            findByLeagueId: jest.fn(),
            findByLeagueIdAndWeek: jest.fn(),
            findByLeagueIdAndRound: jest.fn()
        };
        const matchTransaction = {
            runInTransaction: jest.fn()
        };

        const matchService = createMatchService({ matchStore, matchTransaction });
        const result = await matchService.findMatchById(1);

        expect(matchStore.findById).toHaveBeenCalledWith(1);
        expect(result).toBe(match);
    });

    it("delegates findMatchesByLeagueId to matchStore.findByLeagueId", async () => {
        const matches = [createMatchFixture(1), createMatchFixture(2)];
        const matchStore = {
            save: jest.fn(),
            findById: jest.fn(),
            findByLeagueId: jest.fn().mockResolvedValue(matches),
            findByLeagueIdAndWeek: jest.fn(),
            findByLeagueIdAndRound: jest.fn()
        };
        const matchTransaction = {
            runInTransaction: jest.fn()
        };

        const matchService = createMatchService({ matchStore, matchTransaction });
        const result = await matchService.findMatchesByLeagueId(100);

        expect(matchStore.findByLeagueId).toHaveBeenCalledWith(100);
        expect(result).toBe(matches);
    });

    it("delegates findMatchesByLeagueIdAndWeek to matchStore.findByLeagueIdAndWeek", async () => {
        const matches = [createMatchFixture(1)];
        const matchStore = {
            save: jest.fn(),
            findById: jest.fn(),
            findByLeagueId: jest.fn(),
            findByLeagueIdAndWeek: jest.fn().mockResolvedValue(matches),
            findByLeagueIdAndRound: jest.fn()
        };
        const matchTransaction = {
            runInTransaction: jest.fn()
        };

        const matchService = createMatchService({ matchStore, matchTransaction });
        const result = await matchService.findMatchesByLeagueIdAndWeek(100, 3);

        expect(matchStore.findByLeagueIdAndWeek).toHaveBeenCalledWith(100, 3);
        expect(result).toBe(matches);
    });

    describe("transaction behavior contract", () => {
        it("runs saveMatches through the transaction-scoped store provided by runInTransaction", async () => {
            const matches = [createMatchFixture(1), createMatchFixture(2)];
            const matchStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByLeagueId: jest.fn(),
                findByLeagueIdAndWeek: jest.fn(),
                findByLeagueIdAndRound: jest.fn()
            };

            const transactionalStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByLeagueId: jest.fn(),
                findByLeagueIdAndWeek: jest.fn(),
                findByLeagueIdAndRound: jest.fn(),
                saveMatches: jest.fn().mockResolvedValue(undefined)
            };

            const matchTransaction = {
                runInTransaction: jest.fn().mockImplementation(async (operation) => operation(transactionalStore))
            };

            const matchService = createMatchService({ matchStore, matchTransaction });
            await matchService.saveMatchesInBatch(matches);

            expect(matchTransaction.runInTransaction).toHaveBeenCalledTimes(1);
            expect(transactionalStore.saveMatches).toHaveBeenCalledTimes(1);
            expect(transactionalStore.saveMatches).toHaveBeenCalledWith(matches);
            expect(matchStore.save).not.toHaveBeenCalled();
        });

        it("uses transaction path also for empty batches", async () => {
            const matches: Match[] = [];
            const matchStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByLeagueId: jest.fn(),
                findByLeagueIdAndWeek: jest.fn(),
                findByLeagueIdAndRound: jest.fn()
            };

            const transactionalStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByLeagueId: jest.fn(),
                findByLeagueIdAndWeek: jest.fn(),
                findByLeagueIdAndRound: jest.fn(),
                saveMatches: jest.fn().mockResolvedValue(undefined)
            };

            const matchTransaction = {
                runInTransaction: jest.fn().mockImplementation(async (operation) => operation(transactionalStore))
            };

            const matchService = createMatchService({ matchStore, matchTransaction });
            await matchService.saveMatchesInBatch(matches);

            expect(matchTransaction.runInTransaction).toHaveBeenCalledTimes(1);
            expect(transactionalStore.saveMatches).toHaveBeenCalledWith([]);
        });
    });

    describe("error conditions", () => {
        it("propagates errors from matchStore.save", async () => {
            const match = createMatchFixture(1);
            const matchStore = {
                save: jest.fn().mockRejectedValue(new Error("save failed")),
                findById: jest.fn(),
                findByLeagueId: jest.fn(),
                findByLeagueIdAndWeek: jest.fn(),
                findByLeagueIdAndRound: jest.fn()
            };
            const matchTransaction = {
                runInTransaction: jest.fn()
            };

            const matchService = createMatchService({ matchStore, matchTransaction });

            await expect(matchService.saveMatch(match)).rejects.toThrow("save failed");
            expect(matchStore.save).toHaveBeenCalledWith(match);
        });

        it("propagates errors when transactional saveMatches fails", async () => {
            const matches = [createMatchFixture(1), createMatchFixture(2)];
            const matchStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByLeagueId: jest.fn(),
                findByLeagueIdAndWeek: jest.fn(),
                findByLeagueIdAndRound: jest.fn()
            };

            const transactionalStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByLeagueId: jest.fn(),
                findByLeagueIdAndWeek: jest.fn(),
                findByLeagueIdAndRound: jest.fn(),
                saveMatches: jest.fn().mockRejectedValue(new Error("batch save failed"))
            };

            const matchTransaction = {
                runInTransaction: jest.fn().mockImplementation(async (operation) => operation(transactionalStore))
            };

            const matchService = createMatchService({ matchStore, matchTransaction });

            await expect(matchService.saveMatchesInBatch(matches)).rejects.toThrow("batch save failed");
            expect(matchTransaction.runInTransaction).toHaveBeenCalledTimes(1);
        });

        it("propagates errors from matchTransaction.runInTransaction", async () => {
            const matches = [createMatchFixture(1)];
            const matchStore = {
                save: jest.fn(),
                findById: jest.fn(),
                findByLeagueId: jest.fn(),
                findByLeagueIdAndWeek: jest.fn(),
                findByLeagueIdAndRound: jest.fn()
            };

            const matchTransaction = {
                runInTransaction: jest.fn().mockRejectedValue(new Error("transaction failed"))
            };

            const matchService = createMatchService({ matchStore, matchTransaction });

            await expect(matchService.saveMatchesInBatch(matches)).rejects.toThrow("transaction failed");
            expect(matchTransaction.runInTransaction).toHaveBeenCalledTimes(1);
        });
    });

    describe("configuration guard", () => {
        it("throws when saveMatch is called before configureMatchService", async () => {
            const match = createMatchFixture(1);
            await expect(saveMatch(match)).rejects.toThrow("Match service not configured");
        });

        it("throws when saveMatchesInBatch is called before configureMatchService", async () => {
            const matches = [createMatchFixture(1), createMatchFixture(2)];
            await expect(saveMatchesInBatch(matches)).rejects.toThrow("Match service not configured");
        });

        it("throws when query functions are called before configureMatchService", async () => {
            await expect(findMatchById(1)).rejects.toThrow("Match service not configured");
            await expect(findMatchesByLeagueId(100)).rejects.toThrow("Match service not configured");
            await expect(findMatchesByLeagueIdAndWeek(100, 3)).rejects.toThrow("Match service not configured");
        });
    });
});
