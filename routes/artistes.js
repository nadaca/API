const express = require('express');
const router = express.Router();
const Artiste = require('../models/Artiste');

// GET - Obtenir tous les artistes
router.get('/', async (req, res) => {
    try {
        const artistes = await Artiste.find();
        res.status(200).json({
            success: true,
            count: artistes.length,
            data: artistes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des artistes',
            error: error.message
        });
    }
});

// GET - Obtenir un artiste par ID
router.get('/:id', async (req, res) => {
    try {
        const artiste = await Artiste.findById(req.params.id);
        if (!artiste) {
            return res.status(404).json({
                success: false,
                message: 'Artiste non trouvé'
            });
        }
        res.status(200).json({
            success: true,
            data: artiste
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'artiste',
            error: error.message
        });
    }
});

// POST - Créer un nouvel artiste
router.post('/', async (req, res) => {
    try {
        const artiste = new Artiste({
            nom: req.query.artisteNom || req.body.nom,
            pays: req.query.artistePays || req.body.pays,
            genre: req.query.artisteGenre || req.body.genre,
            biographie: req.query.artisteBio || req.body.biographie
        });
        
        const savedArtiste = await artiste.save();
        res.status(201).json({
            success: true,
            message: 'Artiste créé avec succès',
            data: savedArtiste
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erreur lors de la création de l\'artiste',
            error: error.message
        });
    }
});

// PUT - Mettre à jour un artiste
router.put('/:id', async (req, res) => {
    try {
        const artiste = await Artiste.findByIdAndUpdate(
            req.params.id,
            {
                nom: req.query.artisteNom || req.body.nom,
                pays: req.query.artistePays || req.body.pays,
                genre: req.query.artisteGenre || req.body.genre,
                biographie: req.query.artisteBio || req.body.biographie
            },
            { new: true, runValidators: true }
        );
        
        if (!artiste) {
            return res.status(404).json({
                success: false,
                message: 'Artiste non trouvé'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Artiste mis à jour avec succès',
            data: artiste
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'artiste',
            error: error.message
        });
    }
});

// DELETE - Supprimer un artiste
router.delete('/:id', async (req, res) => {
    try {
        const artiste = await Artiste.findByIdAndDelete(req.params.id);
        
        if (!artiste) {
            return res.status(404).json({
                success: false,
                message: 'Artiste non trouvé'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Artiste supprimé avec succès',
            data: artiste
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'artiste',
            error: error.message
        });
    }
});

module.exports = router;
