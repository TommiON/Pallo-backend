import Club from "../../../domainCore/Club";
import Match from "../../../domainCore/Match";
import Tactics from "../../../domainCore/Tactics";
import { matchResolverDev } from "../MatchResolver";

const createMatch = () => new Match(
    new Club("Home Dev Club"),
    new Club("Away Dev Club"),
    1
);

describe("MatchResolver dev harness", () => {
    it("dummy: runs playDummy and prints the generated events", () => {
        const events = matchResolverDev.playDummy();

        console.log("playDummy() events", events.map((event) => ({
            type: event.type,
            initiator: event.initiator,
            minute: event.minute,
        })));
    });

    it("full: runs play and prints the generated events", () => {
        const match = createMatch();
        const homeTactics = new Tactics();
        const awayTactics = new Tactics();

        const events = matchResolverDev.play(match, homeTactics, awayTactics);

        console.log("play() events", events.map((event) => ({
            type: event.type,
            initiator: event.initiator,
            minute: event.minute,
        })));
    });
});