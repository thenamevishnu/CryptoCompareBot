import { ads_icons, getAdsList } from "../config/ads.config.mjs"
import { settings } from "../config/bot.config.mjs"
import { api } from "../config/tg.config.mjs"

export const defaultOptions = {
    parse_mode: "HTML",
    disable_web_page_preview: true
}

export const sendError = async id => {
    return await api.sendMessage(id, "<i>✖️ Something went wrong. Please try again.</i>", {
        ...defaultOptions
    })
}

export const generateCode = (id) => {
    return crypto.randomUUID().replaceAll("-","") + id
}

export const userMention = (from) => {
    return from.username ? `@${from.username}` : `<a href="tg://user?id=${from.id}">${from.first_name}</a>`
}

export const numberFormat = number => {
    return new Intl.NumberFormat("en-GB", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 2
    }).format(number)
}

export const getAds = async () => {
    const getRandomIndex = (length) => {
        return Math.floor(Math.random() * length)
    }
    const ads = await getAdsList()
    const ad = ads[getRandomIndex(ads.length)]
    const icon = ads_icons[getRandomIndex(ads_icons.length)]
    return ads.length <= 0 ? `<b><a href="https://t.me/${settings.admin.username}">🤙 Place Your Ad</a></b>` : `${icon} <a href="${ad.link}">${ad.label}</a>`
}