import League from "../../domainModel/league/League";
import appDataSource from "../../config/datasource";
import { leagueRepository } from "../../persistence/repositories/repositories";
import { findLeaguesBySeason } from "../leagueService";

jest.mock("../../config/datasource", () => ({
    __esModule: true,
    default: {
        transaction: jest.fn()
    }
}));

jest.mock("../../persistence/repositories/repositories", () => ({
    leagueRepository: {
        find: jest.fn()
    },
    getTransactionalRepositories: jest.fn()
}));

describe("leagueService.findLeaguesBySeason", () => {
    it("loads clubs relation for leagues in the requested season", async () => {
        (leagueRepository.find as jest.Mock).mockResolvedValue([
            {
                id: 1,
                season: 5,
                divisionLevel: 0,
                serialNumberOnDivisionLevel: 0,
                promotesToId: undefined,
                started: true,
                finished: false,
                clubs: [{ id: 10 }]
            }
        ]);

        const result = await findLeaguesBySeason(5);

        expect(leagueRepository.find).toHaveBeenCalledWith({
            where: { season: 5 },
            relations: ["clubs"]
        });
        expect(result).toHaveLength(1);
        expect(result[0]).toBeInstanceOf(League);
        expect(result[0].clubs).toEqual([{ id: 10 }]);
    });
});
