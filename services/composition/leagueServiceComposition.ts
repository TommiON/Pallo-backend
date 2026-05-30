import {
    defaultLeagueStorePort,
    defaultLeagueTransactionPort
} from "../../persistence/adapters/leagueAdapters";
import { LeagueStorePort, LeagueTransactionPort } from "../ports/leaguePorts";

export type LeagueServicePorts = {
    leagueStore: LeagueStorePort;
    leagueTransaction: LeagueTransactionPort;
};

export const createDefaultLeagueServicePorts = (): LeagueServicePorts => {
    return {
        leagueStore: defaultLeagueStorePort,
        leagueTransaction: defaultLeagueTransactionPort
    };
};
