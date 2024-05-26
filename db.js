const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://gandohd:cdatltrnwbrTGCP9@cluster1.dupmfaf.mongodb.net/?retryWrites=true&w=majority';

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
