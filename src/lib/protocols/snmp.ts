import snmp from "net-snmp"

class Client {
    session: snmp.Session
    constructor(options: {
        host: string,
        community?: string
    }) {
        this.session = snmp.createSession(options.host, options.community ?? "public")
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