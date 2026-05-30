import {
    defaultTimeEventsPort,
    defaultTimeStorePort,
    defaultTimeTransactionPort
} from "../../persistence/adapters/timeAdapters";
import { TimeEventsPort, TimeStorePort, TimeTransactionPort } from "../ports/timePorts";

export type TimeServicePorts = {
    timeStore: TimeStorePort;
    timeTransaction: TimeTransactionPort;
    timeEvents: TimeEventsPort;
};

export const createDefaultTimeServicePorts = (): TimeServicePorts => {
    return {
        timeStore: defaultTimeStorePort,
        timeTransaction: defaultTimeTransactionPort,
        timeEvents: defaultTimeEventsPort
    };
};
