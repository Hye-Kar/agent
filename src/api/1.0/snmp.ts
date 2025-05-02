import { Request, Response } from "express";

export function SnmpGET(req: Request, res: Response) {
   
    res.send({
        name: "test",
        status: "online",
        uptime: 1234001,
        description: "Juniper Networks, Inc. ex2300-24t Ethernet Switch, kernel JUNOS 21.4R3-S7.6, Build date: 2024-04-20 09:30:51 UTC Copyright (c) 1996-2024 Juniper Networks, Inc.",
        capabilities: [
            "port.read",
            "mactable.read",
            "port.write",
        ]
    })
}