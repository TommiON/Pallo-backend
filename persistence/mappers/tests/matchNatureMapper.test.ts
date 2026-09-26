import Club from "../../../domainCore/Club";
import Match from "../../../domainCore/Match";
import MatchNature from "../../../domainCore/MatchNature";
import { MatchNatureEntityData } from "../../entities/MatchNatureEntity";
import { fromMatchNatureEntity, toMatchNatureEntityData } from "../matchNatureMapper";

const createMatch = () => {
    const match = new Match(new Club("Home Test Club"), new Club("Away Test Club"), 1);
    match.id = 123;
    return match;
};

describe("matchNatureMapper", () => {
    it("serializes balance and homePossession maps to entity strings", () => {
        const matchNature = MatchNature.createInitial(createMatch(), 0);
        matchNature.pushForPossession("midfield", true);

        const entity = toMatchNatureEntityData(matchNature);

        expect(entity.matchId).toBe(123);
        expect(entity.startMinute).toBe(0);
        expect(entity.endMinute).toBe(15);
        expect(entity.balance).toBe(JSON.stringify([
            ["homeDefenceLeft", 0.1],
            ["homeDefenceCentre", 0.1],
            ["homeDefenceRight", 0.1],
            ["midfield", 0.4],
            ["homeAttackLeft", 0.1],
            ["homeAttackCentre", 0.1],
            ["homeAttackRight", 0.1],
        ]));
        expect(entity.homePossession).toBe(JSON.stringify([
            ["homeDefenceLeft", 0.5],
            ["homeDefenceCentre", 0.5],
            ["homeDefenceRight", 0.5],
            ["midfield", 0.6],
            ["homeAttackLeft", 0.5],
            ["homeAttackCentre", 0.5],
            ["homeAttackRight", 0.5],
        ]));
    });

    it("restores a MatchNature domain object from entity data", () => {
        const entity: MatchNatureEntityData = {
            id: 55,
            matchId: 123,
            match: { id: 123 } as Match,
            startMinute: 15,
            endMinute: 25,
            balance: JSON.stringify([
                ["homeDefenceLeft", 0.12],
                ["homeDefenceCentre", 0.11],
                ["homeDefenceRight", 0.09],
                ["midfield", 0.34],
                ["homeAttackLeft", 0.1],
                ["homeAttackCentre", 0.13],
                ["homeAttackRight", 0.11],
            ]),
            homePossession: JSON.stringify([
                ["homeDefenceLeft", 0.45],
                ["homeDefenceCentre", 0.5],
                ["homeDefenceRight", 0.55],
                ["midfield", 0.62],
                ["homeAttackLeft", 0.48],
                ["homeAttackCentre", 0.51],
                ["homeAttackRight", 0.57],
            ]),
        };

        const matchNature = fromMatchNatureEntity(entity);

        expect(matchNature.id).toBe(55);
        expect(matchNature.match.id).toBe(123);
        expect(matchNature.startMinute).toBe(15);
        expect(matchNature.endMinute).toBe(25);
        expect(matchNature.balance.get("midfield")).toBeCloseTo(0.34, 10);
        expect(matchNature.balance.get("homeAttackCentre")).toBeCloseTo(0.13, 10);
        expect(matchNature.homePossession.get("midfield")).toBeCloseTo(0.62, 10);
        expect(matchNature.homePossession.get("homeDefenceLeft")).toBeCloseTo(0.45, 10);
    });

    it("throws when mapping to entity data without a match id", () => {
        const match = new Match(new Club("Home Test Club"), new Club("Away Test Club"), 1);
        const matchNature = MatchNature.createInitial(match, 0);

        expect(() => toMatchNatureEntityData(matchNature)).toThrow("MatchNature.match.id is required for persistence");
    });
});