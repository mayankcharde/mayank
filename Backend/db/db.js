const mongoose = require('mongoose');

async function connectToDb() {
    try {
        const mongoURI = process.env.MONGODB_URI || process.env.DB_CONNECT;
        if (!mongoURI) {
            throw new Error('MongoDB connection string is not defined');
        }

        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit if cannot connect to database
    }
}

module.exports = connectToDb;