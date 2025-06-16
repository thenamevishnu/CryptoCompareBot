import { AdsModel } from "../models/ads.model.mjs"

export const getAdsList = async () => {
    return await AdsModel.find({})
}

export const ads_icons = ["🚀", "🚁", "🪂", "🛰️", "🛸"]