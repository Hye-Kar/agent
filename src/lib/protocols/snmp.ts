import snmp from "net-snmp"
import parseConfig, { ParsedConfig, RawConfig, satisfiesConfig } from "../config"

class Client {
    session: snmp.Session
    config: ParsedConfig
    constructor(config: RawConfig) {
        if (!satisfiesConfig([
            "snmp.host"
        ], config)) {
            throw new Error("Invalid config")
        }
        console.log(config)
        this.config = parseConfig(config);

        if (typeof this.config.get("snmp.host") !== "string") {
            console.log(this.config.get("snmp.host"))
            throw new Error("snmp.host must be a string")
        }

        this.session = snmp.createSession(this.config.get("snmp.host"), this.config.get("snmp.community") ?? "public")
    }
    get(oid: string[], cb: (error: any, varbinds: any) => void) {
        return this.session.get(oid, cb)
    }
    getBulk(oids: string[], cb: (error: any, varbinds: any) => void) {
        return this.session.getBulk(oids, cb)
    }
    table(oid: string, cb: (error: any, table: any) => void) {
        return this.session.table(oid, cb)
    }
    set(values: {
        oid: string,
        type: number,
        value: any
    }[], cb: (error: any, varbinds: any) => void) {
        return this.session.set(values, cb)
    }
}
function parsePhysAddress(buffer: Buffer) {
    if (!Buffer.isBuffer(buffer)) {
        return "00:00:00:00:00:00";
    }

    return [...buffer]
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(':')
        .toUpperCase();
}
export { Client, parsePhysAddress }