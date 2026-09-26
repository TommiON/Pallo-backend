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
		const createInitialMock = jest.fn().mockImplementation(options.matchNatureFactory);
		jest.doMock("../../../domainCore/MatchNature", () => ({
			__esModule: true,
			default: {
				createInitial: createInitialMock,
			},
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
		resolveMatch: (match: unknown) => { phases: any[]; events: any[] };
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

	it("throws when a resolved phase does not advance time", () => {
		const { resolveMatch } = loadResolveMatchWithDummyMode(false, {
			matchNatureFactory: (_match, minute) => ({ endMinute: minute })
		});
		const match = createMatch();

		expect(() => resolveMatch(match)).toThrow("Match resolver phase did not advance time");
	});
});

