import { settings } from "../config/bot.config.mjs";
import { api } from "../config/tg.config.mjs";
import { defaultOptions, generateCode, getAds, numberFormat, sendError, userMention } from "../lib/bot.mjs";
import { getCryptoChart } from "../lib/chart.mjs";
import { UserModel } from "../models/user.model.mjs";

api.onText(/\/start(?:$|\s+(.*))?/, async (message, match) => {
    try {
        if (message.chat.type != "private") {
            return await api.sendMessage(message.chat.id, "<b>🥱 Hey!</b>", {
                ...defaultOptions,
                reply_to_message_id: message.message_id
            })
        }
        let user = await UserModel.findOne({ _id: message.from.id })
        if (!user) {
            let inviter = match?.[1] ? match[1] : ""
            if (inviter) {
                inviter = await UserModel.findOne({
                    code: inviter
                })
                if (!inviter) {
                    return await api.sendMessage(message.from.id, "<i>✖️ Inviter not found. Please try again.</i>", {
                        ...defaultOptions
                    })
                }
            }
            const userObj = {
                _id: message.from.id,
                first_name: message.from.first_name,
                last_name: message.from.last_name,
                username: message.from.username,
                code: generateCode(message.from.id)
            }
            if (inviter) {
                userObj.inviter = inviter.code
                await UserModel.updateOne({ code: inviter.code }, { $inc: { invites: 1 } });
            }
            user = await UserModel.create(userObj)
            if (!user) {
                return await sendError(message.from.id)
            }
            await api.sendMessage(message.from.id, "<b>✅ You have been registered.</b>", {
                ...defaultOptions
            })
            await api.sendMessage(settings.admin.id, `<b>✅ New user registered:\n\nID: <code>${user._id}</code>\nName: ${user.first_name}${user.last_name ? " " + user.last_name : ""}\nUsername: ${userMention(message.from)}\nInviter: <code>${user.inviter}</code></b>`, {
                ...defaultOptions
            })
        }
        const text = `<b>🐳 Welcome to ${settings.bot.name}\n\n👉 Commands\n/p [from_coin] - Get price in USDT\n/p [from_coin] [to_coin] - Get price in another currency\n\n👉 Examples\n/p btc - Get price of Bitcoin in USDT\n/p btc usd - Get price of Bitcoin in USD\n\n🧑‍💻 Developer: @${settings.admin.username}\n👥 Group: @${settings.chats.group}</b>`
        const key = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "➕ Add me to a group", url: `https://t.me/${settings.bot.username}?startgroup=${user.code}` }]
                ]
            }
        }
        return await api.sendMessage(message.from.id, text, {
            ...defaultOptions,
            ...key,
            reply_to_message_id: message.chat.type == "private" ? message.message_id : null
        })
    } catch (error) {
        return await sendError(message.from.id)
    }
})

api.onText(/\/p(?:$|\s+(.*))?$|\/price(?:$|\s+(.*))?$/, async (message, match) => {
    try {
        const matched = match?.[1] ? match[1].split(" ") : [1, "BTC", "USDT"]
        let amount; let from_coin; let to_coin;
        if (matched[0] && !matched[1] && !matched[2]) {
            amount = 1
            from_coin = matched[0].toUpperCase()
            to_coin = "USDT"
        }
        if (matched[0] && matched[1] && !matched[2]) {
            if (isNaN(matched[0])) {
                amount = 1
                from_coin = matched[0].toUpperCase()
                to_coin = matched[1].toUpperCase()
            } else {
                amount = parseFloat(matched[0])
                from_coin = matched[1].toUpperCase()
                to_coin = "USDT"
            }
        }
        if(matched[0] && matched[1] && matched[2]){
            amount = parseFloat(matched[0])
            from_coin = matched[1].toUpperCase()
            to_coin = matched[2].toUpperCase()
        }
        const response = await fetch(`${process.env.API_URI}/data/pricemultifull?fsyms=${from_coin}&tsyms=${to_coin}`)
        const data = await response.json()
        if (data?.Response == "Error") {
            return await api.sendMessage(message.chat.id, `<b>✖️ ${from_coin}-${to_coin} doesn't exist.</b>`, {
                ...defaultOptions,
                reply_to_message_id: message.message_id
            })
        }
        const raw = data["RAW"][from_coin][to_coin]
        const display = data["DISPLAY"][from_coin][to_coin]
        const text = `<b>${amount.toFixed(2)} ${from_coin}: <code>${display.TOSYMBOL}${(amount * raw.PRICE).toFixed(6)}</code>\n24h Change: <code>${raw.CHANGEPCT24HOUR.toFixed(2)}% ${raw.CHANGEPCT24HOUR.toFixed(2) < 0 ? "🔴" : "🟢"}</code>\n24h Volume: <code>${display.TOSYMBOL}${numberFormat(raw.VOLUME24HOURTO)}</code>\n24h High: <code>${display.TOSYMBOL}${numberFormat(raw.HIGH24HOUR)}</code>\n24h Low: <code>${display.TOSYMBOL}${numberFormat(raw.LOW24HOUR)}</code>\nMarket Cap: <code>${display.TOSYMBOL}${numberFormat(raw.MKTCAP)}</code>\n${await getAds()}</b>`
        return await api.sendMessage(message.chat.id, text, {
            ...defaultOptions,
            reply_to_message_id: message.message_id,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🔄 Refresh", callback_data: `price_refresh ${amount} ${from_coin} ${to_coin} ${Math.floor(new Date().getTime() / 1000)}` }]
                ]
            }
        })
    } catch (error) {
        return sendError(message.chat.id)
    }
})

api.onText(/\/calc(?:$|\s+(.*))?$/, async (message, match) => {
    try {
        const matched = match?.[1] ? match[1].split(" ") : [1, "BTC"]
        let amount; let from_coin;
        if (matched[0] && matched[1]) {
            if (isNaN(matched[0])) {
                amount = 1
            } else {
                amount = parseFloat(matched[0])
            }
            from_coin = matched[1].toUpperCase()
        }
        if (matched[0] && !matched[1]) {
            amount = 1
            from_coin = matched[0].toUpperCase()
        }
        const response = await (await fetch(`${process.env.API_URI}/data/pricemulti?fsyms=${from_coin}&tsyms=USD,USDT,BTC,ETH,LTC,BNB`)).json();
        if (response.Response == "Error") {
            return await api.sendMessage(message.chat.id, `<b>✖️ ${from_coin} doesn't exist.</b>`, {
                ...defaultOptions,
                reply_to_message_id: message.message_id
            })
        }
        const obj = response[from_coin]
        let text = `<b>${amount.toFixed(2)} ${from_coin}</b>\n\n`;
        
        Object.entries(obj).forEach(([currency, value]) => {
            const formattedValue = (value * amount).toFixed(6);
            text += `<b>${currency.padEnd(4)}:</b> <code>${formattedValue}</code>\n`;
        });

        text += `\n${await getAds()}`;
        
        const timestamp = Math.floor(new Date().getTime() / 1000);
        
        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🔄 Refresh", callback_data: `calc_${amount}_${from_coin}_${timestamp}` }],
                    [
                        { text: "¼×", callback_data: `calc_${amount*0.25}_${from_coin}_${timestamp}` },
                        { text: "½×", callback_data: `calc_${amount*0.5}_${from_coin}_${timestamp}` },
                        { text: "2×", callback_data: `calc_${amount*2}_${from_coin}_${timestamp}` },
                        { text: "4×", callback_data: `calc_${amount*4}_${from_coin}_${timestamp}` }
                    ]
                ]
            }
        };
        
        return await api.sendMessage(message.chat.id, text, {
            ...defaultOptions,
            ...keyboard,
            ...defaultOptions,
            parse_mode: 'HTML',
            reply_to_message_id: message.message_id
        })
    } catch (error) {
        console.log(error.message)
        return sendError(message.chat.id)
    }
})

api.onText(/\/chart(?:$|\s+(.*))?$/, async (message, match) => {
    const param = match?.[1] ? match[1].split(" ") : ["BTC", "USDT", "24hr"]
    let from_coin = param[0] ? param[0].toUpperCase() : "BTC"
    let to_coin = param[1] ? param[1].toUpperCase() : "USDT"
    let timeframe = param[2] ? param[2].toLowerCase() : "24hr"
    const response = await getCryptoChart(from_coin, to_coin, timeframe)
    if (response?.error) return api.sendMessage(message.chat.id, `<b>${response.error}</b>`, {
        ...defaultOptions,
        reply_to_message_id: message.message_id
    })
    if (!response?.image) {
        return await api.sendMessage(message.chat.id, `<b>${response}</b>`, {
            ...defaultOptions,
            reply_to_message_id: message.message_id
        })
    }
    return api.sendPhoto(message.chat.id, response.image, {
        caption: `<b>${from_coin}-${to_coin} - ${timeframe}</b>`,
        ...defaultOptions,
        reply_to_message_id: message.message_id
    }, {
        filename: `${crypto.randomUUID()}.jpeg`,
        contentType: "application/octet-stream"
    })
})