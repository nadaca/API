const express = require('express');
const router = express.Router();
const Album = require('../models/Album');
const Chanson = require('../models/Chanson');
const Artiste = require('../models/Artiste');

// GET - Obtenir tous les albums
router.get('/', async (req, res) => {
    try {
        const albums = await Album.find().populate('artiste');
        res.status(200).json({
            success: true,
            count: albums.length,
            data: albums
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des albums',
            error: error.message
        });
    }
});

// GET - Obtenir un album par ID
router.get('/:id', async (req, res) => {
    try {
        const album = await Album.findById(req.params.id).populate('artiste');
        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Album non trouvé'
            });
        }
        res.status(200).json({
            success: true,
            data: album
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'album',
            error: error.message
        });
    }
});

// POST - Créer un nouvel album
router.post('/', async (req, res) => {
    try {
        const album = new Album({
            titre: req.query.albumTitre || req.body.titre,
            artiste: req.query.albumArtiste || req.body.artiste,
            annee: req.query.albumAnnee || req.body.annee
        });
        
        const savedAlbum = await album.save();
        const populatedAlbum = await Album.findById(savedAlbum._id).populate('artiste');
        
        res.status(201).json({
            success: true,
            message: 'Album créé avec succès',
            data: populatedAlbum
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erreur lors de la création de l\'album',
            error: error.message
        });
    }
});

// PUT - Mettre à jour un album
router.put('/:id', async (req, res) => {
    try {
        const album = await Album.findByIdAndUpdate(
            req.params.id,
            {
                titre: req.query.albumTitre || req.body.titre,
                artiste: req.query.albumArtiste || req.body.artiste,
                annee: req.query.albumAnnee || req.body.annee
            },
            { new: true, runValidators: true }
        ).populate('artiste');
        
        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Album non trouvé'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Album mis à jour avec succès',
            data: album
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'album',
            error: error.message
        });
    }
});

// DELETE - Supprimer un album
router.delete('/:id', async (req, res) => {
    try {
        const album = await Album.findByIdAndDelete(req.params.id);
        
        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Album non trouvé'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Album supprimé avec succès',
            data: album
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'album',
            error: error.message
        });
    }
});

// GET - Obtenir toutes les chansons d'un album
router.get('/:id/chansons', async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) {
            return res.status(404).json({
                success: false,
                message: 'Album non trouvé'
            });
        }

        const chansons = await Chanson.find({ album: req.params.id })
            .populate({
                path: 'album',
                populate: { path: 'artiste' }
            })
            .sort('numero');

        res.status(200).json({
            success: true,
            count: chansons.length,
            data: chansons
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des chansons de l\'album',
            error: error.message
        });
    }
});

// DELETE - Retirer une chanson d'un album (supprime la chanson)
router.delete('/:id/chansons/:chansonId', async (req, res) => {
    try {
        const chanson = await Chanson.findOne({
            _id: req.params.chansonId,
            album: req.params.id
        });

        if (!chanson) {
            return res.status(404).json({
                success: false,
                message: 'Chanson non trouvée dans cet album'
            });
        }

        await Chanson.findByIdAndDelete(req.params.chansonId);

        res.status(200).json({
            success: true,
            message: 'Chanson supprimée de l\'album avec succès',
            data: chanson
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la chanson de l\'album',
            error: error.message
        });
    }
});

module.exports = router;
