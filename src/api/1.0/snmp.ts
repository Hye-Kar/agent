import { Request, response, Response } from "express";
import getRackItem from "../../lib/rack/items";
import { parsePhysAddress, Client as SNMPClient } from "../../lib/protocols/snmp";
import ping from "ping";
import hpeg9 from "../../lib/devices/hpeg9";

export async function SnmpGETSummary(req: Request, res: Response) {
    if (!req.params.device) {
        return res.status(400).send({ error: "Missing device parameter" });
    }
    const device = await getRackItem(req.params.device);
    if (!device) {
        return res.status(404).send({ error: "Device not found" });
    }
    res.send({
        uuid: device.uuid,
        type: device.type,
        snmpenabled: device.config.get("snmp.host") ? true : false,
    });
}

export async function SnmpGET(req: Request, res: Response) {
    if (!req.params.device) {
        return res.status(400).send({ error: "Missing device parameter" });
    }
    const device = await getRackItem(req.params.device);
    console.log(device.config._raw)
    if (!device) {
        return res.status(404).send({ error: "Device not found" });
    }

    if (device.type == "switch") {

        if (!req.params.action) {
            return res.status(400).send({ error: "Missing action parameter" });
        }
        const session = new SNMPClient(device.config._raw)
        if (req.params.action == "summary") {
            session.get([
                "1.3.6.1.2.1.1.5.0", // sysName
                "1.3.6.1.2.1.1.3.0", // sysUpTimeInstance
                "1.3.6.1.2.1.25.3.3.1.2.0", //hrProcessorLoad
                "1.3.6.1.2.1.1.1.0",
            ], async (err, varbinds) => {
                if (err) {
                    return res.status(500).send({ error: "Error fetching SNMP data" });
                }
                var pingresponse = await ping.promise.probe(device.config.get("snmp.host"))
                res.send({
                    hostname: varbinds[0].value.toString(), // device hostname
                    status: pingresponse.alive ? "up" : "down", // device status
                    responseTime: parseFloat(pingresponse.avg), // response time in ms
                    ip: device.config.get("snmp.host"), // IP address of the device
                    uptime: varbinds[1].value * 10, // timetick to ms
                    cpuUsage: varbinds[2].value, // CPU usage in %
                    description: varbinds[3].value.toString(), // device description
                })
            })

        } else if (req.params.action == "interfaces") {
            session.table("1.3.6.1.2.1.2.2", (err, table) => {
                if (err) {
                    return res.status(500).send({ error: "Error fetching SNMP table" });
                }
                const interfaces = Object.keys(table).map((i: any) => {
                    const item = table[i];
                    return {
                        index: item["1"],
                        description: item["2"].toString(),
                        type: item["3"],
                        mtu: item["4"],
                        speed: item["5"],
                        macAddress: parsePhysAddress(item["6"]),
                        adminStatus: item["7"],
                        operStatus: item["8"],
                        lastChange: item["9"],
                        inOctets: item["10"],
                        inUcastPkts: item["12"],
                        inNUcastPkts: item["12"],
                        inDiscards: item["13"],
                        inErrors: item["14"],
                        inUnknownProtos: item["15"],
                        outOctets: item["16"],
                        outUcastPkts: item["17"],
                        outNUcastPkts: item["18"],
                        outDiscards: item["19"],
                        outErrors: item["20"],
                        outQLen: item["21"],
                        specific: item["22"],
                    }
                });
                res.send(interfaces);
            })
        } else if (req.params.action == "interface") {
            if (!req.query.ifindex) {
                return res.status(400).send({ error: "Missing interfaceName parameter" });
            }
            const interfaceIndex = parseFloat(req.query.ifindex as string);
            if (isNaN(interfaceIndex)) {
                return res.status(400).send({ error: "Invalid interfaceName parameter" });
            }
            var oids = [
                `1.3.6.1.2.1.2.2.1.1.${interfaceIndex}`, // ifIndex
                `1.3.6.1.2.1.2.2.1.2.${interfaceIndex}`, // ifDescr
                `1.3.6.1.2.1.2.2.1.3.${interfaceIndex}`, // ifType
                `1.3.6.1.2.1.2.2.1.4.${interfaceIndex}`, // ifMtu
                `1.3.6.1.2.1.2.2.1.5.${interfaceIndex}`, // ifSpeed
                `1.3.6.1.2.1.2.2.1.6.${interfaceIndex}`, // ifPhysAddress
                `1.3.6.1.2.1.2.2.1.7.${interfaceIndex}`, // ifAdminStatus
                `1.3.6.1.2.1.2.2.1.8.${interfaceIndex}`, // ifOperStatus
                `1.3.6.1.2.1.2.2.1.9.${interfaceIndex}`, // ifLastChange
                `1.3.6.1.2.1.2.2.1.10.${interfaceIndex}`, // ifInOctets
                `1.3.6.1.2.1.2.2.1.11.${interfaceIndex}`, // ifInUcastPkts
                `1.3.6.1.2.1.2.2.1.12.${interfaceIndex}`, // ifInNUcastPkts
                `1.3.6.1.2.1.2.2.1.13.${interfaceIndex}`, // ifInDiscards
                `1.3.6.1.2.1.2.2.1.14.${interfaceIndex}`, // ifInErrors
                `1.3.6.1.2.1.2.2.1.15.${interfaceIndex}`, // ifInUnknownProtos
                `1.3.6.1.2.1.2.2.1.16.${interfaceIndex}`, // ifOutOctets
                `1.3.6.1.2.1.2.2.1.17.${interfaceIndex}`, // ifOutUcastPkts
                `1.3.6.1.2.1.2.2.1.18.${interfaceIndex}`, // ifOutNUcastPkts
                `1.3.6.1.2.1.2.2.1.19.${interfaceIndex}`, // ifOutDiscards
                `1.3.6.1.2.1.2.2.1.20.${interfaceIndex}`, // ifOutErrors
                `1.3.6.1.2.1.2.2.1.21.${interfaceIndex}`, // ifOutQLen
                `1.3.6.1.2.1.2.2.1.22.${interfaceIndex}`, // ifSpecific
            ]
            session.get(oids, (err, varbinds) => {
                if (err) {
                    if (err.status) {
                        console.error("SNMP error:", err.status);
                        if (err.status == 2) {
                            return res.status(404).send({ error: "Interface not found" });
                        }
                    }
                    return res.status(500).send({ error: "Error fetching SNMP data" });
                }
                const interfaceData = {
                    index: varbinds[0].value,
                    description: varbinds[1].value.toString(),
                    type: varbinds[2].value,
                    mtu: varbinds[3].value,
                    speed: varbinds[4].value,
                    macAddress: parsePhysAddress(varbinds[5].value),
                    adminStatus: varbinds[6].value,
                    operStatus: varbinds[7].value,
                    lastChange: varbinds[8].value,
                    inOctets: varbinds[9].value,
                    inUcastPkts: varbinds[10].value,
                    inNUcastPkts: varbinds[11].value,
                    inDiscards: varbinds[12].value,
                    inErrors: varbinds[13].value,
                    inUnknownProtos: varbinds[14].value,
                    outOctets: varbinds[15].value,
                    outUcastPkts: varbinds[16].value,
                    outNUcastPkts: varbinds[17].value,
                    outDiscards: varbinds[18].value,
                    outErrors: varbinds[19].value,
                    outQLen: varbinds[20].value,
                    specific: varbinds[21].value
                };
                res.send(interfaceData);
            })
        } else {
            return res.status(400).send({ error: "Invalid action parameter" });
        }

    } else if (device.type == "server") {
        if (!req.params.action) {
            return res.status(400).send({ error: "Missing action parameter" });
        }
        if (!device.config.get("snmp.host")) {
            return res.status(400).send({ error: "Missing snmp configuration" });
        }
        const session = new SNMPClient(device.config._raw)
        if (device.model == "hpeg9") {
            //@ts-expect-error
            if (hpeg9[req.params.action] == undefined) {
                return res.status(400).send({ error: "Invalid action parameter" });
            }
            //@ts-expect-error
            hpeg9[req.params.action](device, req, (err, data) => {
                if (err) {
                    return res.status(500).send({ error: "Error fetching SNMP data" });
                }
                res.send(data);
            })
        } else {
            return res.status(400).send({ error: "Invalid device model" });
        }
    }
}