import express, { response } from "express"
import { db } from "./config/db.config.mjs"
import cron from "node-cron"
import "./index.mjs"
import axios from "axios"

await db.connect()
const app = express()

const port = process.env.PORT || 3000

app.get("/status", async (_request, response) => {
    return response.status(200).send({
        message: "Bot is up now."
    })
})

cron.schedule("* * * * *", async () => {
    try {
        const { data } = await axios.get(`${process.env.SERVER}/status`);
        return console.log(data.message);
    } catch (error) {
        return response.status(500).send({
            message: "Bot Down"
        })
    }
})

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
})