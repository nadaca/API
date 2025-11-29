const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');

// Initialisation de l'application Express
const app = express();

// Connexion à MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const usersRouter = require('./routes/users');
const artistesRouter = require('./routes/artistes');
const albumsRouter = require('./routes/albums');
const chansonsRouter = require('./routes/chansons');
const playlistsRouter = require('./routes/playlists');

// Utilisation des routes
app.use('/api/users', usersRouter);
app.use('/api/artistes', artistesRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/chansons', chansonsRouter);
app.use('/api/playlists', playlistsRouter);

// Route de base
app.get('/', (req, res) => {
    res.json({
        message: 'Accueil',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            artistes: '/api/artistes',
            albums: '/api/albums',
            chansons: '/api/chansons',
            playlists: '/api/playlists'
        }
    });
});

// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Route non trouvée'
    });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;
