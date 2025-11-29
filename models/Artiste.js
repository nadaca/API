const mongoose = require('mongoose');

const artisteSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    pays: { type: String, required: true },
    genre: { type: String, required: true },
    biographie: { type: String }
});

module.exports = mongoose.model('Artiste', artisteSchema);
