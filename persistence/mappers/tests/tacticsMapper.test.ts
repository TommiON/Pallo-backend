import Player from "../../../domainCore/Player";
import Tactics from "../../../domainCore/Tactics";
import { TacticsEntityData } from "../../entities/TacticsEntity";
import { TacticsLineupSlotEntityData } from "../../entities/TacticsLineupSlotEntity";
import { fromTacticsEntity, toTacticsEntityData } from "../tacticsMapper";

describe("tacticsMapper", () => {
    it("serializes lineup slots in order with player ids", () => {
        const tactics = new Tactics("3-5-2", "Direct");
        tactics.id = 44;

        const players = Array.from({ length: 11 }, (_, index) => {
            const player = new Player();
            player.id = index + 100;
            return player;
        });

        tactics.setLineup(players);

        const entity = toTacticsEntityData(tactics);

        expect(entity.id).toBe(44);
        expect(entity.formation).toBe("3-5-2");
        expect(entity.masterTactic).toBe("Direct");
        expect(entity.lineupSlots).toHaveLength(11);
        expect(entity.lineupSlots?.[0]).toMatchObject({
            tacticsId: 44,
            slotIndex: 0,
            position: "goalkeeper",
            playerId: 100,
        });
        expect(entity.lineupSlots?.[7]).toMatchObject({
            tacticsId: 44,
            slotIndex: 7,
            position: "wingback_left",
            playerId: 107,
        });
    });

    it("restores tactics and sorts lineup slots by slot index", () => {
        const lineupSlots: TacticsLineupSlotEntityData[] = [
            { tacticsId: 12, slotIndex: 2, position: "center_back", playerId: 202 },
            { tacticsId: 12, slotIndex: 0, position: "goalkeeper", playerId: 200 },
            { tacticsId: 12, slotIndex: 1, position: "center_back", playerId: null },
            { tacticsId: 12, slotIndex: 3, position: "center_back", playerId: 203 },
            { tacticsId: 12, slotIndex: 4, position: "midfielder_left", playerId: 204 },
            { tacticsId: 12, slotIndex: 5, position: "midfielder_right", playerId: 205 },
            { tacticsId: 12, slotIndex: 6, position: "midfielder_center", playerId: 206 },
            { tacticsId: 12, slotIndex: 7, position: "wingback_left", playerId: 207 },
            { tacticsId: 12, slotIndex: 8, position: "wingback_right", playerId: 208 },
            { tacticsId: 12, slotIndex: 9, position: "forward_center", playerId: 209 },
            { tacticsId: 12, slotIndex: 10, position: "forward_center", playerId: 210 },
        ];

        const entity: TacticsEntityData = {
            id: 12,
            formation: "3-5-2",
            masterTactic: "Balanced",
            lineupSlots,
        };

        const tactics = fromTacticsEntity(entity);

        expect(tactics.id).toBe(12);
        expect(tactics.formation).toBe("3-5-2");
        expect(tactics.masterTactic).toBe("Balanced");
        expect(tactics.lineup).toHaveLength(11);
        expect(tactics.lineup[0].position).toBe("goalkeeper");
        expect(tactics.lineup[0].player?.id).toBe(200);
        expect(tactics.lineup[1].position).toBe("center_back");
        expect(tactics.lineup[1].player).toBeNull();
        expect(tactics.lineup[7].position).toBe("wingback_left");
        expect(tactics.lineup[8].position).toBe("wingback_right");
        expect(tactics.lineup[10].player?.id).toBe(210);
    });
});