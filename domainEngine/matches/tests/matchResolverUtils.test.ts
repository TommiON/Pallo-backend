import Club from "../../../domainCore/Club";
import Match from "../../../domainCore/Match";
import MatchEvent from "../../../domainCore/MatchEvent";
import MatchNature from "../../../domainCore/MatchNature";
import Tactics from "../../../domainCore/Tactics";
import { getRandomNumberInRange } from "../../../domainCore/domainUtils";
import { MatchResolverFilterResult } from "../MatchResolverFilter";
import { getALegalMinuteForEvent } from "../utils/matchResolverUtils";

jest.mock("../../../domainCore/domainUtils", () => ({
    ...jest.requireActual("../../../domainCore/domainUtils"),
    getRandomNumberInRange: jest.fn(),
}));

const getRandomNumberInRangeMock = getRandomNumberInRange as jest.MockedFunction<typeof getRandomNumberInRange>;

const createMatch = () => new Match(
    new Club("Home Test Club"),
    new Club("Away Test Club"),
    1
);

const createInput = (startMinute: number, matchEvents: MatchEvent[] = []): MatchResolverFilterResult => ({
    homeTactics: new Tactics(),
    awayTactics: new Tactics(),
    currentMatchNature: MatchNature.createInitial(createMatch(), startMinute),
    previousMatchNatures: [],
    matchEvents,
});

describe("getALegalMinuteForEvent", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getRandomNumberInRangeMock.mockReturnValue(42);
    });

    it("uses the current phase start and end when there are no previous events", () => {
        const input = createInput(15);

        const minute = getALegalMinuteForEvent(input);

        expect(getRandomNumberInRangeMock).toHaveBeenCalledWith(15, input.currentMatchNature.endMinute);
        expect(minute).toBe(42);
    });

    it("uses the latest previous event minute as the lower bound when it is inside the current phase", () => {
        const latestEvent = new MatchEvent("goal", 24, "home");
        const input = createInput(15, [new MatchEvent("yellow_card", 18, "away"), latestEvent]);

        const minute = getALegalMinuteForEvent(input);

        expect(getRandomNumberInRangeMock).toHaveBeenCalledWith(25, input.currentMatchNature.endMinute);
        expect(minute).toBe(42);
    });

    it("does not allow an event earlier than the current phase start even if the latest event happened before the phase", () => {
        const input = createInput(30, [new MatchEvent("goal", 12, "home")]);

        const minute = getALegalMinuteForEvent(input);

        expect(getRandomNumberInRangeMock).toHaveBeenCalledWith(30, input.currentMatchNature.endMinute);
        expect(minute).toBe(42);
    });
});