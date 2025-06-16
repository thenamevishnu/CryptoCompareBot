import { api } from "../config/tg.config.mjs";
import { defaultOptions, getAds, numberFormat } from "../lib/bot.mjs";

api.on('inline_query', async (query) => {
    const searchQuery = query.query.trim()

    if (!searchQuery) {
        return api.answerInlineQuery(query.id, [], {
            switch_pm_text: 'Enter amount and crypto pairs (e.g. 1 BTC USDT)',
            switch_pm_parameter: 'help'
        });
    }

    try {
        const matched = searchQuery.split(" ");
        console.log(matched)
        let amount = 1, from_coin = "BTC", to_coin = "USDT";
        switch (matched.length) {
            case 1:
                from_coin = matched[0].toUpperCase();
                break;
            case 2:
                if (isNaN(matched[0])) {
                    from_coin = matched[0].toUpperCase();
                    to_coin = matched[1].toUpperCase();
                } else {
                    amount = parseFloat(matched[0]);
                    from_coin = matched[1].toUpperCase();
                }
                break;
            case 3:
                amount = parseFloat(matched[0]);
                from_coin = matched[1].toUpperCase();
                to_coin = matched[2].toUpperCase();
                break;
            default:
                api.answerInlineQuery(query.id, [], {
                    switch_pm_text: 'Error: Invalid input format',
                    switch_pm_parameter: 'error'
                })
                break;
        }

        if (isNaN(amount) || amount <= 0) {
            throw new Error("Invalid amount");
        }

        const response = await fetch(`${process.env.API_URI}/data/pricemultifull?fsyms=${from_coin}&tsyms=${to_coin}`);
        const data = await response.json();

        if (data?.Response === "Error") {
            return api.answerInlineQuery(query.id, [], {
                switch_pm_text: `Error: ${from_coin}-${to_coin} pair doesn't exist`,
                switch_pm_parameter: 'error'
            });
        }

        const raw = data.RAW[from_coin][to_coin];
        const display = data.DISPLAY[from_coin][to_coin];
        const changeEmoji = raw.CHANGEPCT24HOUR < 0 ? "🔴" : "🟢";
        const changePct = raw.CHANGEPCT24HOUR.toFixed(2);
        const priceFormatted = (amount * raw.PRICE).toFixed(6);

        const result = [{
            type: 'article',
            id: `${from_coin}_${to_coin}_${Date.now()}`,
            title: `${amount} ${from_coin} to ${to_coin}`,
            description: `${display.TOSYMBOL}${priceFormatted} | 24h: ${changePct}% ${changeEmoji}`,
            input_message_content: {
                message_text: `<b>${amount.toFixed(2)} ${from_coin}: <code>${display.TOSYMBOL}${(amount * raw.PRICE).toFixed(6)}</code>\n24h Change: <code>${raw.CHANGEPCT24HOUR.toFixed(2)}% ${raw.CHANGEPCT24HOUR.toFixed(2) < 0 ? "🔴" : "🟢"}</code>\n24h Volume: <code>${display.TOSYMBOL}${numberFormat(raw.VOLUME24HOURTO)}</code>\n24h High: <code>${display.TOSYMBOL}${numberFormat(raw.HIGH24HOUR)}</code>\n24h Low: <code>${display.TOSYMBOL}${numberFormat(raw.LOW24HOUR)}</code>\nMarket Cap: <code>${display.TOSYMBOL}${numberFormat(raw.MKTCAP)}</code>\n${await getAds()}</b>`,
                ...defaultOptions,
            },
            thumb_url: `https://cryptocompare.com${raw.IMAGEURL}`,
            thumb_width: 48,
            thumb_height: 48
        }];

        return api.answerInlineQuery(query.id, [{...result[0], reply_markup: {
                inline_keyboard: [
                [{ text: `🔄 Refresh ${amount} ${from_coin} to ${to_coin}`, switch_inline_query_current_chat: `${amount} ${from_coin} ${to_coin}`}]
                ]
            }
        }]);
    } catch (error) {
        console.log(error)
        return api.answerInlineQuery(query.id, [], {
            switch_pm_text: 'Error: Invalid input format',
            switch_pm_parameter: 'error'
        });
    }
});
