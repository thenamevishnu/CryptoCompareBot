import { settings } from "../config/bot.config.mjs";
import { api } from "../config/tg.config.mjs";
import { defaultOptions, sendError, userMention } from "../lib/bot.mjs";

api.onText(/\/joke$/, async message => {
    try {
        const { setup, punchline } = await (await fetch(`${process.env.JOKE_API}`)).json()
        const text = `<b>${setup}\n- ${punchline}</b>`
        return await api.sendMessage(message.chat.id, text, {
            ...defaultOptions,
            reply_to_message_id: message.message_id
        })
    } catch (error) {
        return sendError(message.chat.id)
    }
})

api.onText(/\/id/, async message => {
    try {
        return await api.sendMessage(message.chat.id, `<b>Chat ID: <code>${message.chat.id}</code>\n${message.reply_to_message ? message.reply_to_message.from.is_bot && "Bot" : "User"} ID: <code>${message.reply_to_message ? message.reply_to_message.from.id : message.from.id}</code></b>`, {
            ...defaultOptions,
            reply_to_message_id: message.message_id
        })
    } catch (errror) {
        return sendError(message.chat.id)
    }
})

api.onText(/\/coin_flip$/, message => {
    const coins = ["Heads", "Tails"];
    const random = Math.floor(Math.random() * coins.length)
    return api.sendMessage(message.chat.id, `<b>${coins[random]}</b>`, {
        ...defaultOptions,
        reply_to_message_id: message.message_id
    })
})

api.onText(/\/select(?:$|\s+(.*))?$/, async (message, match) => {
    try {
        const options = match?.[1]?.split(" ");
        const errorMessage = "<b>❌ Invalid format!\n\n📝 Usage: /select [number_of_winners] [name1] [name2] [name3]...\n\n📌 Example:\n/select 2 John Alice Bob Carol</b>";

        if (!options) {
            return await api.sendMessage(message.chat.id, errorMessage, {
                ...defaultOptions,
                reply_to_message_id: message.message_id
            });
        }

        const [winnersCount, ...names] = options;
        const numWinners = parseInt(winnersCount);

        if (isNaN(numWinners) || numWinners <= 0) {
            return await api.sendMessage(message.chat.id, "<b>❌ Please provide a valid positive number of winners!</b>", {
                ...defaultOptions,
                reply_to_message_id: message.message_id
            });
        }

        if (names.length < 2) {
            return await api.sendMessage(message.chat.id, "<b>❌ Please provide at least 2 names to select from!</b>", {
                ...defaultOptions,
                reply_to_message_id: message.message_id
            });
        }

        if (numWinners > names.length) {
            return await api.sendMessage(message.chat.id, "<b>❌ Number of winners cannot exceed the number of participants!</b>", {
                ...defaultOptions,
                reply_to_message_id: message.message_id
            });
        }

        const winners = [];
        const namesCopy = [...names];

        for (let i = 0; i < numWinners; i++) {
            const randomIndex = Math.floor(Math.random() * namesCopy.length);
            winners.push(namesCopy.splice(randomIndex, 1)[0]);
        }

        let text = "<b>🎉 Random Selection Results 🎉</b>\n\n";
        winners.forEach((winner, index) => {
            text += `<b>${index + 1}. 👑 ${winner}</b>\n`;
        });

        text += `\n<i>🎲 Selection made by ${userMention(message.from)}</i>`;

        return await api.sendMessage(message.chat.id, text, {
            ...defaultOptions,
            reply_to_message_id: message.message_id
        });

    } catch (error) {
        return await sendError(message.chat.id);
    }
});

api.onText(/\/help$/, async (message) => {
    try {
        const mainText = `<b>🤖 Welcome to the Help Center!</b>\n\n<i><b>Here you can find all available commands and features of our bot.</b></i>\n\n<b>📚 Categories:</b>\n• <i><b><code>💰 Crypto Price</code></b></i> - <i>All cryptocurrency price-related commands</i>\n• <i><b><code>🎮 Fun Commands</code></b></i> - <i>Entertainment and random selection features</i>\n• <i><b><code>ℹ️ Other Commands</code></b></i> - <i>Basic bot functionality and utilities</i>\n\n<i><b>Select a category below to learn more!</b></i>`;
        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "💰 Crypto Price", callback_data: "help_crypto" },
                        { text: "🎮 Fun Commands", callback_data: "help_fun" }
                    ],
                    [
                        { text: "ℹ️ Other Commands", callback_data: "help_other" }
                    ]
                ]
            }
        };

        return await api.sendMessage(message.chat.id, mainText, {
            ...defaultOptions,
            ...keyboard,
            parse_mode: 'HTML',
            reply_to_message_id: message.message_id
        });
    } catch (error) {
        return await sendError(message.chat.id);
    }
});

api.onText(/\/dev$/, async message => {
    try {
        const text = `<b>Developer: @${settings.admin.username}</b>`
        return await api.sendMessage(message.chat.id, text, {
            ...defaultOptions,
            reply_to_message_id: message.message_id
        })
    } catch (error) {
        return await sendError(message.chat.id);
    }
})

api.onText(/\/request_feature(?:$|\s+(.+))?/, async (message, match) => {
    try {
        if (message.chat.type !== "private") {
            return await api.sendMessage(message.chat.id, "<b>⚠️ This command can only be used in private chat!</b>", {
                ...defaultOptions,
                reply_to_message_id: message.message_id
            });
        }

        const feature = match?.[1]?.trim();
        
        if (!feature) {
            return await api.sendMessage(message.chat.id, "<b>❌ Please provide a feature description!\n\n📝 Usage: /request_feature [your feature request]</b>", {
                ...defaultOptions,
                reply_to_message_id: message.message_id
            });
        }

        const requestText = `<b>📨 New Feature Request</b>\n\n` +
            `<b>From:</b> ${userMention(message.from)}\n` +
            `<b>Request:</b> ${feature}`;

        await api.sendMessage(settings.admin.id, requestText, defaultOptions);

        return await api.sendMessage(message.chat.id, "<b>✅ Your feature request has been sent to the developer!\n\nThank you for your feedback! 🙏</b>", {
            ...defaultOptions,
            reply_to_message_id: message.message_id
        });

    } catch (error) {
        return await sendError(message.chat.id);
    }
});
