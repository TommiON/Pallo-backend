import Club from "../domainModel/club/Club";
import Time from "../domainModel/time/Time";

export type AppEventNotifications = {
    "time.changed": Time;
    "club.created": Club;
};

export type EventHandler<TPayload> = (payload: TPayload) => void | Promise<void>;

type EventHandlerMap<TEvents extends Record<string, unknown>> = {
    [K in keyof TEvents]?: EventHandler<TEvents[K]>[];
};

export class EventNotificationBus<TEvents extends Record<string, unknown>> {
    private handlers: EventHandlerMap<TEvents> = {};

    on<TKey extends keyof TEvents>(
        eventName: TKey,
        handler: EventHandler<TEvents[TKey]>
    ): () => void {
        const currentHandlers = this.handlers[eventName] ?? [];
        currentHandlers.push(handler);
        this.handlers[eventName] = currentHandlers;

        return () => this.off(eventName, handler);
    }

    off<TKey extends keyof TEvents>(
        eventName: TKey,
        handler: EventHandler<TEvents[TKey]>
    ): void {
        const currentHandlers = this.handlers[eventName];
        if (!currentHandlers) {
            return;
        }

        this.handlers[eventName] = currentHandlers.filter(
            (currentHandler) => currentHandler !== handler
        );
    }

    emit<TKey extends keyof TEvents>(eventName: TKey, payload: TEvents[TKey]): void {
        const currentHandlers = this.handlers[eventName];
        if (!currentHandlers || currentHandlers.length === 0) {
            return;
        }

        currentHandlers.forEach((handler) => {
            Promise.resolve(handler(payload)).catch((error) => {
                console.error(`Event handler failed for ${String(eventName)}`, error);
            });
        });
    }
}

export const eventNotifications = new EventNotificationBus<AppEventNotifications>();
