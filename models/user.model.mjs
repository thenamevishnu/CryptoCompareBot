import { model, Schema } from "mongoose";
import { settings } from "../config/bot.config.mjs";

const userSchema = new Schema({
    _id: {
        type: Number,
        required: true,
        unique: true
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
    },
    username: {
        type: String,
    },
    code: {
        type: String,
        required: true,
    },
    inviter: {
        type: String,
        default: settings.admin.id,
    },
    invites: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
})

export const UserModel = model("users", userSchema)