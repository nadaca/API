const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET - Obtenir tous les utilisateurs
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs',
            error: error.message
        });
    }
});

// GET - Obtenir un utilisateur par ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l\'utilisateur',
            error: error.message
        });
    }
});

// POST - Créer un nouvel utilisateur
router.post('/', async (req, res) => {
    try {
        const user = new User({
            nom: req.query.nom || req.body.nom,
            prenom: req.query.prenom || req.body.prenom,
            email: req.query.email || req.body.email
        });
        
        const savedUser = await user.save();
        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: savedUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erreur lors de la création de l\'utilisateur',
            error: error.message
        });
    }
});

// PUT - Mettre à jour un utilisateur
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                nom: req.query.nom || req.body.nom,
                prenom: req.query.prenom || req.body.prenom,
                email: req.query.email || req.body.email
            },
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Utilisateur mis à jour avec succès',
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'utilisateur',
            error: error.message
        });
    }
});

// DELETE - Supprimer un utilisateur
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Utilisateur supprimé avec succès',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'utilisateur',
            error: error.message
        });
    }
});

module.exports = router;
