import express from "express"
import dotenv from "dotenv"
import router from "./api/1.0/router";

dotenv.config();
const app = express()

app.use("/1.0", router)

app.listen(process.env.APP_PORT, (data) => {
    console.log("Listening on", process.env.APP_PORT)
})