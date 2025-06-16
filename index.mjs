import { api } from "./config/tg.config.mjs"
import "./controllers/text.mjs"
import "./controllers/other_text.mjs"
import "./controllers/callback_query.mjs"
import "./controllers/inline.mjs"

api.on("polling_error", ()=>{});