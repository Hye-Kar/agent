export type ParsedConfig = {
    get: (key: string) => any;
    _raw: RawConfig
}
export type RawConfig = {
    key: string,
    value: any
}[]
export default function parseConfig(config: {
    key: string,
    value: string
}[]): ParsedConfig {
    return {
        get: (key: string): any => {
            config.find(value => value.key == key)
        },
        _raw: config
    }
}
export function satisfiesConfig(requiredKeys: string[], config: RawConfig | ParsedConfig) {
    if (typeof config == "object" && "_raw" in config) {
        config = config._raw
    }
    if (!Array.isArray(config)) {
        return false
    }
    if (config.length == 0) {
        return false
    }
    const providedKeys = new Set(config.map(item => item.key));
    return requiredKeys.every(key => providedKeys.has(key));
}