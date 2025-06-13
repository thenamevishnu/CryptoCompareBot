import TelegramBot from "node-telegram-bot-api";

export const api = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: {
        autoStart: true
    }
})