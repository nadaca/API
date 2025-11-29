const express = require('express');
const router = express.Router();
const Chanson = require('../models/Chanson');
const Album = require('../models/Album');

// GET - Obtenir toutes les chansons
router.get('/', async (req, res) => {
    try {
        const chansons = await Chanson.find().populate({
            path: 'album',
            populate: { path: 'artiste' }
        });
        res.status(200).json({
            success: true,
            count: chansons.length,
            data: chansons
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des chansons',
            error: error.message
        });
    }
});

// GET - Obtenir une chanson par ID
router.get('/:id', async (req, res) => {
    try {
        const chanson = await Chanson.findById(req.params.id).populate({
            path: 'album',
            populate: { path: 'artiste' }
        });
        if (!chanson) {
            return res.status(404).json({
                success: false,
                message: 'Chanson non trouvée'
            });
        }
        res.status(200).json({
            success: true,
            data: chanson
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la chanson',
            error: error.message
        });
    }
});

// POST - Créer une nouvelle chanson
router.post('/', async (req, res) => {
    try {
        const chanson = new Chanson({
            titre: req.query.chansonTitre || req.body.titre,
            album: req.body.album,
            duree: req.query.chansonDuree || req.body.duree,
            numero: req.query.chansonNumero || req.body.numero
        });
        
        const savedChanson = await chanson.save();
        const populatedChanson = await Chanson.findById(savedChanson._id).populate({
            path: 'album',
            populate: { path: 'artiste' }
        });
        
        res.status(201).json({
            success: true,
            message: 'Chanson créée avec succès',
            data: populatedChanson
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erreur lors de la création de la chanson',
            error: error.message
        });
    }
});

// PUT - Mettre à jour une chanson
router.put('/:id', async (req, res) => {
    try {
        const chanson = await Chanson.findByIdAndUpdate(
            req.params.id,
            {
                titre: req.query.chansonTitre || req.body.titre,
                album: req.body.album,
                duree: req.query.chansonDuree || req.body.duree,
                numero: req.query.chansonNumero || req.body.numero
            },
            { new: true, runValidators: true }
        ).populate({
            path: 'album',
            populate: { path: 'artiste' }
        });
        
        if (!chanson) {
            return res.status(404).json({
                success: false,
                message: 'Chanson non trouvée'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Chanson mise à jour avec succès',
            data: chanson
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la chanson',
            error: error.message
        });
    }
});

// DELETE - Supprimer une chanson
router.delete('/:id', async (req, res) => {
    try {
        const chanson = await Chanson.findByIdAndDelete(req.params.id);
        
        if (!chanson) {
            return res.status(404).json({
                success: false,
                message: 'Chanson non trouvée'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Chanson supprimée avec succès',
            data: chanson
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la chanson',
            error: error.message
        });
    }
});

module.exports = router;
