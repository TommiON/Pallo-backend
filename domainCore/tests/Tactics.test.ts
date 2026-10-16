import Player from "../Player";
import Tactics from "../Tactics";

describe("Tactics lineup", () => {
    it("creates an empty lineup matching the formation slots", () => {
        const tactics = new Tactics("3-5-2");

        expect(tactics.lineup).toHaveLength(11);
        expect(tactics.lineup[0]).toEqual({ position: "goalkeeper", player: null });
        expect(tactics.lineup[1]).toEqual({ position: "center_back", player: null });
        expect(tactics.lineup[7]).toEqual({ position: "midfielder_center", player: null });
        expect(tactics.lineup[8]).toEqual({ position: "wingback_left", player: null });
        expect(tactics.lineup[9]).toEqual({ position: "wingback_right", player: null });
    });

    it("maps players onto formation slots in order, including repeated positions", () => {
        const tactics = new Tactics("3-5-2");
        const players = Array.from({ length: 11 }, () => new Player());

        tactics.setLineup(players);

        expect(tactics.lineup).toHaveLength(11);
        expect(tactics.lineup[1].position).toBe("center_back");
        expect(tactics.lineup[2].position).toBe("center_back");
        expect(tactics.lineup[3].position).toBe("center_back");
        expect(tactics.lineup[4].position).toBe("midfielder_left");
        expect(tactics.lineup[7].position).toBe("midfielder_center");
        expect(tactics.lineup[8].position).toBe("wingback_left");
        expect(tactics.lineup[9].position).toBe("wingback_right");
        expect(tactics.lineup[10].player).toBe(players[10]);
    });

    it("rejects a lineup with the wrong number of players", () => {
        const tactics = new Tactics();

        expect(() => tactics.setLineup(Array.from({ length: 10 }, () => new Player()))).toThrow(
            "Expected 11 players for formation 4-4-2, got 10"
        );
    });
});