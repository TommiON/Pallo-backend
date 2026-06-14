const loadResolveMatchWithDummyMode = (dummyMode: boolean) => {
	jest.resetModules();

	jest.doMock("../../../domainCore/domainProperties", () => ({
		...jest.requireActual("../../../domainCore/domainProperties"),
		MATCH_DUMMY_MODE: dummyMode
	}));

	const getRandomNumberInRangeMock = jest.fn();
	jest.doMock("../../../domainCore/domainUtils", () => ({
		...jest.requireActual("../../../domainCore/domainUtils"),
		getRandomNumberInRange: getRandomNumberInRangeMock
	}));

	const { resolveMatch } = require("../MatchResolver") as {
		resolveMatch: () => any[];
	};

	return { resolveMatch, getRandomNumberInRangeMock };
};

describe("MatchResolver.resolveMatch", () => {
	afterEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
		jest.dontMock("../../../domainCore/domainProperties");
		jest.dontMock("../../../domainCore/domainUtils");
	});

	it("palauttaa tyhjän listan kun MATCH_DUMMY_MODE on false", () => {
		const { resolveMatch, getRandomNumberInRangeMock } = loadResolveMatchWithDummyMode(false);

		const events = resolveMatch();

		expect(events).toEqual([]);
		expect(getRandomNumberInRangeMock).not.toHaveBeenCalled();
	});

	it("palauttaa deterministisesti dummy-maalitapahtumat kun MATCH_DUMMY_MODE on true", () => {
		const { resolveMatch, getRandomNumberInRangeMock } = loadResolveMatchWithDummyMode(true);

		getRandomNumberInRangeMock
			.mockReturnValueOnce(2) // numberOfHomeGoals
			.mockReturnValueOnce(1) // numberOfAwayGoals
			.mockReturnValueOnce(12) // home minute 1
			.mockReturnValueOnce(55) // home minute 2
			.mockReturnValueOnce(89); // away minute 1

		const events = resolveMatch();

		expect(getRandomNumberInRangeMock).toHaveBeenCalledTimes(5);
		expect(events).toHaveLength(3);
		expect(events.map((e) => e.type)).toEqual(["goal", "goal", "goal"]);
		expect(events.map((e) => e.initiator)).toEqual(["home", "home", "away"]);
		expect(events.map((e) => e.minute)).toEqual([12, 55, 89]);
	});
});

