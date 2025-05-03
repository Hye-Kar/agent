import { Request } from "express";
import { RackDevice } from "../rack/items";
import { Client as SNMPClient } from "../protocols/snmp";
import ping from "ping";

export default {
    summary: (device: RackDevice, session: SNMPClient, req: Request, callback: (err: any, data: any) => void) => {
        session.get([
            "1.3.6.1.2.1.1.5.0", // sysName
            "1.3.6.1.2.1.1.3.0", // sysUpTimeInstance
            "1.3.6.1.2.1.1.1.0",
        ], async (err, varbinds) => {
            if (err) {
                return callback({ error: "Error fetching SNMP data" }, null);
            }
            var pingresponse = await ping.promise.probe(device.config.get("snmp.host"))
            callback(null, {
                hostname: varbinds[0].value.toString(), // device hostname
                status: pingresponse.alive ? "up" : "down", // device status
                responseTime: parseFloat(pingresponse.avg), // response time in ms
                ip: device.config.get("snmp.host"), // IP address of the device
                uptime: varbinds[1].value * 10, // timetick to ms
                description: varbinds[2].value.toString(), // device description
            })
        })
    },
    getaudit: (device: RackDevice, req: Request, callback: (err: any, data: any) => void) => {

    }
}