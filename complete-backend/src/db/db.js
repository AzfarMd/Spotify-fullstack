const mongoose = require('mongoose');

async function connectDB() {


    try {

        if (!process.env.MONGO_URI) {
            console.log('Note: MONGO_URI is not set in .env. Running Express server without database.');
            return;
        }
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Database connected successfully');

    }
    catch (error) {
        console.error('Database connection error:', error);
    }

}

module.exports = connectDB;