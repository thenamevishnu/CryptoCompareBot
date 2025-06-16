import { model, Schema } from "mongoose";

const adSchema = new Schema({
    label: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

export const AdsModel = model("ads", adSchema)