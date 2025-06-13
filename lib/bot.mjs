import { ads, ads_icons } from "../config/ads.config.mjs"
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

export const getAds = () => {
    const getRandomIndex = (length) => {
        return Math.floor(Math.random() * length)
    }
    const ad = ads[getRandomIndex(ads.length)]
    const icon = ads_icons[getRandomIndex(ads_icons.length)]
    return `${icon} <a href="${ad.link}">${ad.label}</a>`
}
