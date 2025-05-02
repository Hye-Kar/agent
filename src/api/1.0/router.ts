import express from "express"
import { SnmpGET } from "./snmp";

const router = express.Router()

router.get("/snmp/:device", SnmpGET)

export default router;