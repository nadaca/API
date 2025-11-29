const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const PlaylistChanson = require('../models/PlaylistChanson');
const User = require('../models/User');
const Chanson = require('../models/Chanson');

// GET - Obtenir toutes les playlists
router.get('/', async (req, res) => {
    try {
        const playlists = await Playlist.find().populate('utilisateur');
        res.status(200).json({
            success: true,
            count: playlists.length,
            data: playlists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des playlists',
            error: error.message
        });
    }
});

// GET - Obtenir une playlist par ID
router.get('/:id', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id).populate('utilisateur');
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist non trouvée'
            });
        }
        res.status(200).json({
            success: true,
            data: playlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la playlist',
            error: error.message
        });
    }
});

// POST - Créer une nouvelle playlist
router.post('/', async (req, res) => {
    try {
        const playlist = new Playlist({
            nom: req.query.playlistNom || req.body.nom,
            utilisateur: req.body.utilisateur
        });
        
        const savedPlaylist = await playlist.save();
        const populatedPlaylist = await Playlist.findById(savedPlaylist._id).populate('utilisateur');
        
        res.status(201).json({
            success: true,
            message: 'Playlist créée avec succès',
            data: populatedPlaylist
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erreur lors de la création de la playlist',
            error: error.message
        });
    }
});

// PUT - Mettre à jour une playlist
router.put('/:id', async (req, res) => {
    try {
        const playlist = await Playlist.findByIdAndUpdate(
            req.params.id,
            {
                nom: req.query.playlistNom || req.body.nom,
                utilisateur: req.body.utilisateur
            },
            { new: true, runValidators: true }
        ).populate('utilisateur');
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist non trouvée'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Playlist mise à jour avec succès',
            data: playlist
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la playlist',
            error: error.message
        });
    }
});

// DELETE - Supprimer une playlist
router.delete('/:id', async (req, res) => {
    try {
        const playlist = await Playlist.findByIdAndDelete(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist non trouvée'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Playlist supprimée avec succès',
            data: playlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la playlist',
            error: error.message
        });
    }
});

// GET - Obtenir toutes les chansons d'une playlist
router.get('/:id/chansons', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist non trouvée'
            });
        }

        const playlistChansons = await PlaylistChanson.find({ playlist: req.params.id })
            .populate({
                path: 'chanson',
                populate: {
                    path: 'album',
                    populate: { path: 'artiste' }
                }
            })
            .sort('ordre');

        res.status(200).json({
            success: true,
            count: playlistChansons.length,
            data: playlistChansons
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des chansons de la playlist',
            error: error.message
        });
    }
});

// POST - Ajouter une chanson à une playlist
router.post('/:id/chansons', async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: 'Playlist non trouvée'
            });
        }

        const chanson = await Chanson.findById(req.body.chansonId);
        if (!chanson) {
            return res.status(404).json({
                success: false,
                message: 'Chanson non trouvée'
            });
        }

        // Obtenir le prochain numéro d'ordre
        const count = await PlaylistChanson.countDocuments({ playlist: req.params.id });
        const ordre = req.body.ordre || count + 1;

        const playlistChanson = new PlaylistChanson({
            playlist: req.params.id,
            chanson: req.body.chansonId,
            ordre: ordre
        });

        await playlistChanson.save();

        const populatedPlaylistChanson = await PlaylistChanson.findById(playlistChanson._id)
            .populate({
                path: 'chanson',
                populate: {
                    path: 'album',
                    populate: { path: 'artiste' }
                }
            });

        res.status(201).json({
            success: true,
            message: 'Chanson ajoutée à la playlist avec succès',
            data: populatedPlaylistChanson
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Cette chanson est déjà dans la playlist'
            });
        }
        res.status(400).json({
            success: false,
            message: 'Erreur lors de l\'ajout de la chanson à la playlist',
            error: error.message
        });
    }
});

// DELETE - Retirer une chanson d'une playlist
router.delete('/:id/chansons/:chansonId', async (req, res) => {
    try {
        const playlistChanson = await PlaylistChanson.findOneAndDelete({
            playlist: req.params.id,
            chanson: req.params.chansonId
        });

        if (!playlistChanson) {
            return res.status(404).json({
                success: false,
                message: 'Chanson non trouvée dans cette playlist'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Chanson retirée de la playlist avec succès',
            data: playlistChanson
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors du retrait de la chanson de la playlist',
            error: error.message
        });
    }
});

module.exports = router;
