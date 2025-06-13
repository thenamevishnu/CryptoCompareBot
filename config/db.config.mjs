import { connect } from "mongoose";

export const db = {
    connect: async () => {
        try {
            const { connection : { db : { databaseName } } } = await connect(process.env.DB_URL, {
                dbName: process.env.DB_NAME,
                autoIndex: false
            });
            console.log('Connected to MongoDB => ', databaseName);
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }
    }
}