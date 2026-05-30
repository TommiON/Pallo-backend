import {
    defaultClubEventsPort,
    defaultClubStorePort,
    defaultClubTransactionPort
} from "../../persistence/adapters/clubAdapters";
import { ClubEventsPort, ClubStorePort, ClubTransactionPort } from "../ports/clubPorts";

export type ClubServicePorts = {
    clubStore: ClubStorePort;
    clubTransaction: ClubTransactionPort;
    clubEvents: ClubEventsPort;
};

export const createDefaultClubServicePorts = (): ClubServicePorts => {
    return {
        clubStore: defaultClubStorePort,
        clubTransaction: defaultClubTransactionPort,
        clubEvents: defaultClubEventsPort
    };
};
