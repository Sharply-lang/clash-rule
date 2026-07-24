
import {
    filterNodes,
    setupProxyGroups,
    setupNetworkSettings,
    setupBaseConfig,
    setupProfile,
    setupCommonRules,
} from './common.js';

export function main(config) {
    config = setupCommonRules(config)
    config = filterNodes(config);
    config = setupProxyGroups(config);
    config = setupBaseConfig(config);
    config = setupProfile(config);
    config = setupNetworkSettings(config)

    return config;
}
