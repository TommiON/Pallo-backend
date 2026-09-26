const createMatch = () => {
	const { default: Club } = require("../../../domainCore/Club") as {
		default: typeof import("../../../domainCore/Club").default;
	};
	const { default: Match } = require("../../../domainCore/Match") as {
		default: typeof import("../../../domainCore/Match").default;
	};

	return new Match(new Club("Home Test Club"), new Club("Away Test Club"), 1);
};

const loadResolveMatchWithDummyMode = (dummyMode: boolean, options?: {
	matchNatureFactory?: (match: unknown, minute: number) => { endMinute: number };
}) => {
	jest.resetModules();

	jest.doMock("../../../domainCore/domainProperties", () => ({
		...jest.requireActual("../../../domainCore/domainProperties"),
		GAME_DUMMY_MODE: dummyMode
	}));

	if (options?.matchNatureFactory) {
		jest.doMock("../../../domainCore/MatchNature", () => ({
			__esModule: true,
			default: jest.fn().mockImplementation(options.matchNatureFactory)
		}));
	}

	const getRandomNumberInRangeMock = jest.fn();
	const getRandomElementMock = jest.fn();
	jest.doMock("../../../domainCore/domainUtils", () => ({
		...jest.requireActual("../../../domainCore/domainUtils"),
		getRandomNumberInRange: getRandomNumberInRangeMock,
		getRandomElement: getRandomElementMock,
	}));

	const { resolveMatch } = require("../MatchResolver") as {
		resolveMatch: (match: unknown) => any[];
	};

	return { resolveMatch, getRandomNumberInRangeMock, getRandomElementMock };
};

describe("MatchResolver.resolveMatch", () => {
	let consoleLogSpy: jest.SpyInstance;

	beforeEach(() => {
		consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
		jest.resetModules();
		jest.clearAllMocks();
		jest.dontMock("../../../domainCore/domainProperties");
		jest.dontMock("../../../domainCore/domainUtils");
		jest.dontMock("../../../domainCore/MatchNature");
	});

	it("palauttaa tyhjän listan kun MATCH_DUMMY_MODE on false", () => {
		const { resolveMatch, getRandomNumberInRangeMock } = loadResolveMatchWithDummyMode(false);
		const match = createMatch();

		const events = resolveMatch(match);

		expect(events).toEqual([]);
		expect(getRandomNumberInRangeMock).not.toHaveBeenCalled();
	});

	it("palauttaa deterministisesti dummy-maalitapahtumat kun MATCH_DUMMY_MODE on true", () => {
		const { resolveMatch, getRandomNumberInRangeMock, getRandomElementMock } = loadResolveMatchWithDummyMode(true);
		const match = createMatch();

		getRandomNumberInRangeMock
			.mockReturnValueOnce(12)
			.mockReturnValueOnce(25)
			.mockReturnValueOnce(55);

		getRandomElementMock
			.mockReturnValueOnce("unchanged§")
			.mockReturnValueOnce(true)
			.mockReturnValueOnce("home")
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(false)
			.mockReturnValueOnce("unchanged§")
			.mockReturnValueOnce(true)
			.mockReturnValueOnce("home")
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(false)
			.mockReturnValueOnce("unchanged§")
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(false)
			.mockReturnValueOnce("unchanged§")
			.mockReturnValueOnce(true)
			.mockReturnValueOnce("away")
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(false)
			.mockReturnValueOnce("unchanged§")
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(false)
			.mockReturnValueOnce("unchanged§")
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(false);

		const events = resolveMatch(match);

		expect(getRandomNumberInRangeMock).toHaveBeenCalledTimes(3);
		expect(events).toHaveLength(3);
		expect(events.map((e) => e.type)).toEqual(["goal", "goal", "goal"]);
		expect(events.map((e) => e.initiator)).toEqual(["home", "home", "away"]);
		expect(events.map((e) => e.minute)).toEqual([12, 25, 55]);
	});

	it("throws when a resolved phase does not advance time", () => {
		const { resolveMatch } = loadResolveMatchWithDummyMode(false, {
			matchNatureFactory: (_match, minute) => ({ endMinute: minute })
		});
		const match = createMatch();

		expect(() => resolveMatch(match)).toThrow("Match resolver phase did not advance time");
	});
});

