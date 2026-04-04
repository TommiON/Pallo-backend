import { createLeaguePyramidFixture } from "./testFixtures";
import { promoteAndRelegate } from "../promoRelegator";


describe('PromoRelegator', () => {
    it('testTest', async () => {
        const leagues1 = createLeaguePyramidFixture({
            numberOfLevels: 2,
            clubsPerLeague: 6,
            spanFactor: 2,
            symmetric: false,
        });
        const result1 = await promoteAndRelegate(leagues1);

        const leagues2 = createLeaguePyramidFixture({
            numberOfLevels: 2,
            clubsPerLeague: 6,
            spanFactor: 2,
            symmetric: true,
        });
        const result2 = await promoteAndRelegate(leagues2);

        const leagues3 = createLeaguePyramidFixture({
            numberOfLevels: 2,
            clubsPerLeague: 8,
            spanFactor: 4,
            symmetric: true,
        });
        const result3 = await promoteAndRelegate(leagues3);

        const leagues4 = createLeaguePyramidFixture({
            numberOfLevels: 3,
            clubsPerLeague: 8,
            spanFactor: 2,
            symmetric: true,
        });
        const result4 = await promoteAndRelegate(leagues4);

        const leagues5 = createLeaguePyramidFixture({
            numberOfLevels: 3,
            clubsPerLeague: 8,
            spanFactor: 2,
            symmetric: false,
        });
        const result5 = await promoteAndRelegate(leagues5);
    });
});