const mongoose = require('mongoose');

const albumSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    artiste: { type: mongoose.Schema.Types.ObjectId, ref: 'Artiste', required: true },
    annee: { type: Number, required: true }
});

module.exports = mongoose.model('Album', albumSchema);
