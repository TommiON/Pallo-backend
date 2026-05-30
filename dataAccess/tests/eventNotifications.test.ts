import { EventNotificationBus } from "../eventNotifications";

type TestEventNotifications = {
    "test.number": number;
    "test.message": string;
};

describe("eventNotifications", () => {
    it("calls a subscribed handler with the emitted payload", () => {
        const bus = new EventNotificationBus<TestEventNotifications>();
        const handler = jest.fn();

        bus.on("test.number", handler);
        bus.emit("test.number", 42);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(42);
    });

    it("unsubscribes a handler when the returned function is called", () => {
        const bus = new EventNotificationBus<TestEventNotifications>();
        const handler = jest.fn();

        const unsubscribe = bus.on("test.message", handler);
        unsubscribe();
        bus.emit("test.message", "hello");

        expect(handler).not.toHaveBeenCalled();
    });

    it("logs when an async handler throws", async () => {
        const bus = new EventNotificationBus<TestEventNotifications>();
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);

        bus.on("test.number", async () => {
            throw new Error("boom");
        });

        bus.emit("test.number", 1);
        await new Promise((resolve) => setImmediate(resolve));

        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy.mock.calls[0][0]).toContain("test.number");
        expect(consoleErrorSpy.mock.calls[0][1]).toBeInstanceOf(Error);

        consoleErrorSpy.mockRestore();
    });
});
