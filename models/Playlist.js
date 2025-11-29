const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Playlist', playlistSchema);
