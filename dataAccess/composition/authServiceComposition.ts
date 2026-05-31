import { defaultAuthStorePort } from "../../persistence/adapters/authAdapters";
import { AuthStorePort } from "../ports/authPorts";

export type AuthServicePorts = {
    authStore: AuthStorePort;
};

export const createDefaultAuthServicePorts = (): AuthServicePorts => {
    return {
        authStore: defaultAuthStorePort
    };
};
