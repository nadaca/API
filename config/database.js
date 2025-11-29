const mongoose = require('mongoose');

// Configuration pour éviter le warning strictQuery
mongoose.set('strictQuery', false);

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/musicAPIDB', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connecté à MongoDB');
    } catch (error) {
        console.error('❌ Erreur de connexion à MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
