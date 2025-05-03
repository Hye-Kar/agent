import parseConfig, { ParsedConfig } from "../config"
import { RackItemType } from "../../types/types"
export type RackDevice = {
    uuid: string,
    name: string,
    type: RackItemType,
    config: ParsedConfig,
    created: Date,
    updated: Date,
    model?: string,
    inventory: {
        type: string,
        value: any
    }[]
}

export default async function getRackItem(uuid: string): Promise<RackDevice | null> {
    // add lookup logic here
    // this is just a stub for now
    if (uuid === "a2df3b4e-5c6d-7e8f-9a0b-c1d2e3f4g5h6") {
        return {
            uuid: uuid,
            name: "Test Rack Item",
            type: "switch",
            config: parseConfig([
                { key: "snmp.host", value: process.env.TEST_SNMP_HOST },
                { key: "snmp.community", value: process.env.TEST_SNMP_COMMUNITY }
            ]),
            inventory: [
                { type: "cpu", value: "Custom CPU" },
                { type: "ram", value: "100mb" },
                { type: "ports", value: 24 },
                { type: "serial", value: "123456789" },
                { type: "model", value: "Test Model" },
            ],
            created: new Date(),
            updated: new Date(),
        }
    } else if (uuid === "b3df4c5e-6d7e-8f9a-0b-c1d2e3f4g5h6") {
        return {
            uuid: uuid,
            name: "Test Rack Item Server",
            type: "server",
            model: "hpeg9",
            config: parseConfig([
                { key: "snmp.host", value: process.env.TEST_SNMP_HOST2 },
                { key: "snmp.community", value: process.env.TEST_SNMP_COMMUNITY2 }
            ]),
            inventory: [
                { type: "cpu", value: "Custom CPU" },
                { type: "ram", value: "100mb" },
                { type: "ports", value: 24 },
                { type: "serial", value: "123456789" },
                { type: "model", value: "Test Model" },
            ],
            created: new Date(),
            updated: new Date(),
        };
    } else {
        return null;
    }


}