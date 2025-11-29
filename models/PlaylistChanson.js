const mongoose = require('mongoose');

const playlistChansonSchema = new mongoose.Schema({
    playlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist', required: true },
    chanson: { type: mongoose.Schema.Types.ObjectId, ref: 'Chanson', required: true },
    ordre: { type: Number, required: true }
});

// Index unique pour éviter les doublons
playlistChansonSchema.index({ playlist: 1, chanson: 1 }, { unique: true });

module.exports = mongoose.model('PlaylistChanson', playlistChansonSchema);
