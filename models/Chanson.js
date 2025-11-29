const mongoose = require('mongoose');

const chansonSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true },
    duree: { type: Number, required: true }, // durée en secondes
    numero: { type: Number, required: true } // numéro de piste
});

module.exports = mongoose.model('Chanson', chansonSchema);
