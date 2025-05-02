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

        this.config = parseConfig(config);
        
        if (this.config.get("snmp.host") !== typeof "string") {
            throw new Error("snmp.host must be a string")
        }

        this.session = snmp.createSession(this.config.get("snmp.host"), this.config.get("snmp.community") ?? "public")
    }
    get(oid: string, cb: (error: any, varbinds: any) => void) {
        return this.session.get([oid], cb)
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

export { Client }