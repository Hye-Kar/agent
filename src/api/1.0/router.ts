//@ts-nocheck
import express from "express"
import { SnmpGET, SnmpGETSummary } from "./snmp";

const router = express.Router()

router.get("/devices/:device/snmp/:action", SnmpGET)
router.get("/devices/:device/snmp", SnmpGETSummary)

export default router;