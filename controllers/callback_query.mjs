import { commands } from "../config/commands.config.mjs";
import { api } from "../config/tg.config.mjs";
import { defaultOptions, getAds, numberFormat } from "../lib/bot.mjs";

api.on("callback_query", async (query) => {
    try {
        const chatId = query.message.chat.id;
        const queryData = query.data;
        const message = query.message;

        if (queryData.startsWith("price_refresh")) {
            const currentTime = Math.floor(new Date().getTime() / 1000);
            const [_, amount, from_coin, to_coin, nextUpdate] = queryData.split(" ");

            if (currentTime < nextUpdate) {
                return await api.answerCallbackQuery(query.id, {
                    text: `Please wait ${nextUpdate - currentTime} seconds before refreshing.`,
                });
            }

            const response = await fetch(
                `${process.env.API_URI}/data/pricemultifull?fsyms=${from_coin}&tsyms=${to_coin}`
            );
            const data = await response.json();
            const raw = data["RAW"][from_coin][to_coin];
            const display = data["DISPLAY"][from_coin][to_coin];
            const text = `<b>${parseFloat(amount).toFixed(2)} ${from_coin}: <code>${display.TOSYMBOL}${(parseFloat(amount) * raw.PRICE).toFixed(6)}</code>\n24h Change: <code>${raw.CHANGEPCT24HOUR.toFixed(2)}%</code>\n24h Volume: <code>${display.TOSYMBOL}${numberFormat(raw.VOLUME24HOURTO)}</code>\n24h High: <code>${display.TOSYMBOL}${numberFormat(raw.HIGH24HOUR)}</code>\n24h Low: <code>${display.TOSYMBOL}${numberFormat(raw.LOW24HOUR)}</code>\nMarket Cap: <code>${display.TOSYMBOL}${numberFormat(raw.MKTCAP)}</code>\n${await getAds()}</b>`;

            return await api.editMessageText(text, {
                chat_id: message.chat.id,
                message_id: message.message_id,
                ...defaultOptions,
                reply_to_message_id: message.message_id,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔄 Refresh",
                                callback_data: `price_refresh ${amount} ${from_coin} ${to_coin} ${currentTime + 15}`,
                            },
                        ],
                    ],
                },
            });
        }

        if (queryData.startsWith("calc_")) {
            const [_, amount, from_coin, timestamp] = queryData.split("_");
            const currentTime = Math.floor(new Date().getTime() / 1000);

            if (currentTime < parseInt(timestamp) + 15) {
                return await api.answerCallbackQuery(query.id, {
                    text: `Please wait ${parseInt(timestamp) + 15 - currentTime} seconds before refreshing.`,
                });
            }

            const response = await (
                await fetch(
                    `${process.env.API_URI}/data/pricemulti?fsyms=${from_coin}&tsyms=USD,USDT,BTC,ETH,LTC,BNB`
                )
            ).json();

            if (response.Response == "Error") {
                return await api.answerCallbackQuery(query.id, {
                    text: `${from_coin} doesn't exist.`,
                });
            }

            const obj = response[from_coin];
            let text = `<b>${parseFloat(amount).toFixed(2)} ${from_coin}</b>\n\n`;

            Object.entries(obj).forEach(([currency, value]) => {
                const formattedValue = (value * parseFloat(amount)).toFixed(6);
                text += `<b>${currency.padEnd(4)}:</b> <code>${formattedValue}</code>\n`;
            });

            text += `\n${await getAds()}`;

            const newTimestamp = Math.floor(new Date().getTime() / 1000);

            return await api.editMessageText(text, {
                chat_id: message.chat.id,
                message_id: message.message_id,
                ...defaultOptions,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "🔄 Refresh",
                                callback_data: `calc_${amount}_${from_coin}_${newTimestamp}`,
                            },
                        ],
                        [
                            {
                                text: "¼×",
                                callback_data: `calc_${parseFloat(amount) * 0.25}_${from_coin}_${newTimestamp}`,
                            },
                            {
                                text: "½×",
                                callback_data: `calc_${parseFloat(amount) * 0.5}_${from_coin}_${newTimestamp}`,
                            },
                            {
                                text: "2×",
                                callback_data: `calc_${parseFloat(amount) * 2}_${from_coin}_${newTimestamp}`,
                            },
                            {
                                text: "4×",
                                callback_data: `calc_${parseFloat(amount) * 4}_${from_coin}_${newTimestamp}`,
                            },
                        ],
                    ],
                },
            });
        }

        if (queryData.startsWith("help_crypto")) {
            const [_, count = 0] = queryData.split(" ");
            const newCount = parseInt(count) + 1;
            const text = `<b>💰 Crypto Price Commands</b>\n\n` + 
                commands.crypto.map(cmd => 
                    `<b><code>${cmd.command}</code> - ${cmd.description}</b>`
                ).join('\n');

            return await api.editMessageText(text, {
                chat_id: chatId,
                message_id: message.message_id,
                parse_mode: "HTML",
                ...defaultOptions,
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "💰 Crypto Price",
                                callback_data: `help_crypto ${newCount}`,
                            },
                            { text: "🎮 Fun Commands", callback_data: `help_fun 0` },
                        ],
                        [{ text: "ℹ️ Other Commands", callback_data: `help_other 0` }],
                    ],
                },
            });
        }

        if (queryData.startsWith("help_fun")) {
            const [_, count = 0] = queryData.split(" ");
            const newCount = parseInt(count) + 1;
            const text = `<b>🎮 Fun Commands</b>\n\n` +
                commands.fun.map(cmd => 
                    `<b><code>${cmd.command}</code> - ${cmd.description}</b>`
                ).join('\n');

            return await api.editMessageText(text, {
                chat_id: chatId,
                message_id: message.message_id,
                parse_mode: "HTML",
                ...defaultOptions,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "💰 Crypto Price", callback_data: `help_crypto 0` },
                            {
                                text: "🎮 Fun Commands",
                                callback_data: `help_fun ${newCount}`,
                            },
                        ],
                        [{ text: "ℹ️ Other Commands", callback_data: `help_other 0` }],
                    ],
                },
            });
        }

        if (queryData.startsWith("help_other")) {
            const [_, count = 0] = queryData.split(" ");
            const newCount = parseInt(count) + 1;
            const text = `<b>ℹ️ Other Commands</b>\n\n` +
                commands.other.map(cmd => 
                    `<b><code>${cmd.command}</code> - ${cmd.description}</b>`
                ).join('\n');

            return await api.editMessageText(text, {
                chat_id: chatId,
                message_id: message.message_id,
                parse_mode: "HTML",
                ...defaultOptions,
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: "💰 Crypto Price", callback_data: `help_crypto 0` },
                            { text: "🎮 Fun Commands", callback_data: `help_fun 0` },
                        ],
                        [
                            {
                                text: "ℹ️ Other Commands",
                                callback_data: `help_other ${newCount}`,
                            },
                        ],
                    ],
                },
            });
        }
    } catch (error) {
        console.error(error);
    }
});
