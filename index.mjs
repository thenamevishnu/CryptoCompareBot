import { api } from "./config/tg.config.mjs"
import "./controllers/text.mjs"
import "./controllers/callback_query.mjs"

api.on("polling_error", ()=>{});