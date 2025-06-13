import express from "express"
import { db } from "./config/db.config.mjs"
import "./index.mjs"

await db.connect()
const app = express()

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
})