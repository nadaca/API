# Music API - Documentation technique

## 1. Introduction

### 1.1 Présentation du projet

Projet d'API de site de streaming de musique (similaire à spotify ou deezer) réalisé dans le cadre du cours Back-End par DJAMAI CAYOL Naël et MEHARZI Dalya, étudiants IR4 à l'ESAIP.

### 1.2 Objectifs fonctionnels

L'API développée répond aux besoins suivants :
- Opérations CRUD (Create, Read, Update, Delete) sur l'ensemble des entités
- Gestion d'un catalogue d'artistes incluant une description
- Organisation des chansons au sein d'albums
- Création de playlists personnalisées avec gestion de l'ordonnancement des morceaux
- Relations entre entités permettant une navigation cohérente des données

### 1.3 Stack technique

Le projet repose sur les technologies suivantes :

| Technologie | Rôle | Justification |
|-------------|------|---------------|
| **Node.js** | Environnement d'exécution | Permet l'utilisation de JavaScript côté serveur |
| **Express.js** | Framework web | Framework minimaliste facilitant la création d'API REST |
| **MongoDB** | Système de gestion de base de données | Base NoSQL adaptée aux structures de données flexibles |
| **Mongoose** | ODM (Object Data Modeling) | Abstraction simplifiant l'interaction avec MongoDB |
| **CORS** | Middleware | Gestion des politiques de partage de ressources entre origines |
| **Body-parser** | Middleware | Analyse et parsing des requêtes HTTP au format JSON |
| **Nodemon** | Outil de développement | Rechargement automatique du serveur lors des modifications |

---

## 2. Architecture du système

### 2.1 Patron architectural

L'application adopte une architecture **MVC (Model-View-Controller)** simplifiée, pattern reconnu pour la séparation des rôles dans les applications web. Cette architecture a été adaptée au contexte d'une API REST pure, où la couche "View" est remplacée par des réponses JSON.

```
API/
├── config/              # Configuration de l'application
│   └── database.js      # Configuration MongoDB/Mongoose
├── models/              # Modèles de données (Mongoose schemas)
│   ├── User.js
│   ├── Artiste.js
│   ├── Album.js
│   ├── Chanson.js
│   ├── Playlist.js
│   └── PlaylistChanson.js
├── routes/              # Routes et contrôleurs
│   ├── users.js
│   ├── artistes.js
│   ├── albums.js
│   ├── chansons.js
│   └── playlists.js
├── app.js               # Point d'entrée de l'application
├── package.json         # Dépendances et scripts
├── .gitignore           # Fichiers exclus de Git
├── Postman-liste-exhaustive.json    # Collection Postman exhaustives
└── Postman-test.json    # Collection Postman avec tests automatisés
```

### Schéma de base de données

```mermaid
erDiagram
    User ||--o{ Playlist : "possède"
    Artiste ||--o{ Album : "interprète"
    Album ||--o{ Chanson : "contient"
    Playlist ||--o{ PlaylistChanson : "a"
    Chanson ||--o{ PlaylistChanson : "dans"
    
    User {
        ObjectId _id PK
        string nom
        string prenom
        string email UK
    }
    
    Artiste {
        ObjectId _id PK
        string nom
        string pays
        string genre
        string biographie
    }
    
    Album {
        ObjectId _id PK
        string titre
        ObjectId artiste FK
        number annee
    }
    
    Chanson {
        ObjectId _id PK
        string titre
        ObjectId album FK
        number duree
        number numero
    }
    
    Playlist {
        ObjectId _id PK
        string nom
        ObjectId utilisateur FK
    }
    
    PlaylistChanson {
        ObjectId _id PK
        ObjectId playlist FK
        ObjectId chanson FK
        number ordre
    }
```
---

## 3. Structure du projet et description des composants

### 3.1 Organisation des répertoires

Le projet s'organise selon une structure modulaire favorisant la maintenabilité et l'évolutivité du code.

### 3.2 Couche de configuration (`config/`)

#### 3.2.1 `database.js`
Ce module centralise la configuration de la connexion à la base de données MongoDB.

**Fonctionnalités implémentées :**
- Configuration du paramètre `strictQuery` de Mongoose pour éviter les avertissements de dépréciation
- Fonction asynchrone `connectDB()` gérant l'établissement de la connexion
- Mécanisme de gestion des erreurs de connexion

### 3.3 Couche modèle (`models/`)

Cette couche définit les schémas de données selon le paradigme de Mongoose. Chaque modèle correspond à une collection MongoDB.

#### 3.3.1 Modèle `User`
Représente les utilisateurs du système.

**Attributs :**
- `nom` : Nom de famille de l'utilisateur
- `prenom` : Prénom de l'utilisateur  
- `email` : Adresse électronique (contrainte d'unicité appliquée)

**Cardinalités :** Un utilisateur peut créer plusieurs playlists (relation 1:N)

#### 3.3.2 Modèle `Artiste`
Représente les artistes musicaux référencés dans le système.

**Attributs :**
- `nom` : Nom de l'artiste ou du groupe
- `pays` : Pays d'origine
- `genre` : Genre musical principal
- `biographie` : Description textuelle

**Cardinalités :** Un artiste peut avoir plusieurs albums (relation 1:N)

#### 3.3.3 Modèle `Album`
Représente un album musical.

**Attributs :**
- `titre` : Titre de l'album
- `artiste` : Référence vers l'entité Artiste (clé étrangère)
- `annee` : Année de sortie

**Cardinalités :** Un album est lié à un artiste et contient plusieurs chansons (relations 1:N)

#### 3.3.4 Modèle `Chanson`
Représente une chanson individuelle.

**Attributs :**
- `titre` : Titre de la chanson
- `album` : Référence vers l'entité Album (clé étrangère)
- `duree` : Durée en secondes
- `numero` : Position dans l'album (ordre de passage)

**Cardinalités :** Une chanson appartient à un album et peut être présente dans plusieurs playlists

#### 3.3.5 Modèle `Playlist`
Représente une playlist créée par un utilisateur.

**Attributs :**
- `nom` : Nom de la playlist
- `utilisateur` : Référence vers l'entité User (clé étrangère)

**Cardinalités :** Une playlist appartient à un utilisateur et contient plusieurs chansons (relation N:M via table de jonction)

#### 3.3.6 Modèle `PlaylistChanson` (Table de jonction)
Implémente la relation many-to-many entre Playlist et Chanson avec attribut supplémentaire.

**Attributs :**
- `playlist` : Référence vers l'entité Playlist
- `chanson` : Référence vers l'entité Chanson
- `ordre` : Position de la chanson dans la playlist

**Contraintes :** Index unique composite sur (playlist, chanson) empêchant les doublons

### 3.4 Couche contrôleur (`routes/`)

Les fichiers de routes implémentent à la fois le routage et la logique métier (pattern Controller).

#### 3.4.1 `users.js`
Expose les endpoints CRUD pour la gestion des utilisateurs.

**Particularité :** Acceptation des paramètres soit via query string, soit via body JSON (double modalité d'entrée)

#### 3.4.2 `artistes.js`
Expose les endpoints CRUD pour la gestion des artistes.

**Particularité :** Double modalité d'entrée (query params / body JSON)

#### 3.4.3 `albums.js`
Gère les opérations CRUD sur les albums et leurs relations avec les chansons.

**Endpoints additionnels :**
- `GET /api/albums/:id/chansons` : Récupération des chansons d'un album avec tri par numéro
- `DELETE /api/albums/:id/chansons/:chansonId` : Suppression d'une chanson de l'album

**Mécanisme de population :** Utilisation de `populate()` pour récupérer les données liées (artiste)

#### 3.4.4 `chansons.js`
Expose les endpoints CRUD pour la gestion des chansons.
---

## 4. Spécification des endpoints

L'ensemble des routes exposées par l'API sont préfixées par `/api/` selon les bonnes pratiques REST. la relation avec les chansons.

**Endpoints additionnels :**
- `GET /api/playlists/:id/chansons` : Récupération des chansons avec population en cascade (chanson → album → artiste)
- `POST /api/playlists/:id/chansons` : Ajout d'une chanson avec gestion automatique ou manuelle de l'ordre
- `DELETE /api/playlists/:id/chansons/:chansonId` : Retrait d'une chanson de la playlist

### 3.5 Point d'entrée (`app.js`)

Fichier principal initialisant l'application Express.

**Rôle :**
- Configuration des middlewares (CORS, body-parser)
- Enregistrement des routes sous le préfixe `/api/`
- Établissement de la connexion MongoDB
- Démarrage du serveur HTTP sur le port 3005
- Route racine `/` retournant la documentation de l'API

### 3.6 Configuration npm (`package.json`)

Définit les métadonnées du projet et les dépendances.

**Scripts définis :**
- `npm start` : Exécution en mode production (node)
- `npm run dev` : Exécution en mode développement (nodemon avec rechargement automatique)

### 3.7 Collections Postman

#### 3.7.1 `Postman-liste-exhaustive.json`
Collection destinée aux tests manuels exploratoires.

**Caractéristiques :**
- Variables de collection pour le stockage des identifiants
- Couverture exhaustive de tous les endpoints
- Valeurs par défaut vides nécessitant une saisie manuelle

#### 3.7.2 `Postman-test.json`
Collection automatisée pour les tests d'intégration.

**Caractéristiques :**
- Séquence ordonnée de 16 requêtes
- Scripts de tests automatiques avec assertions
- Capture automatique des identifiants générés
- Validation de la structure des réponsesques
- Capture automatique des IDs
- Assertions de validation

---

## Liste complète des routes
La liste complète des routes peut être importée dans Postman via le fichier `Postman-liste-exhaustive.json`

Toutes les routes sont préfixées par `/api/`.

### Users (`/api/users`)

| Méthode | URL | Description | Corps JSON |
|---------|-----|-------------|------------|
| **GET** | `/api/users` | Liste tous les utilisateurs | - |
| **GET** | `/api/users/:id` | Récupère un utilisateur par ID | - |
| **POST** | `/api/users` | Crée un nouvel utilisateur | Voir exemple ci-dessous |
| **PUT** | `/api/users/:id` | Modifie un utilisateur | Voir exemple ci-dessous |
| **DELETE** | `/api/users/:id` | Supprime un utilisateur | - |

![](assets/2025-11-29-17-49-52.png)
![](assets/2025-11-29-17-50-11.png)
(avec un mail existant)
![](assets/2025-11-29-17-51-10.png)
![](assets/2025-11-29-17-51-38.png)
![](assets/2025-11-29-17-52-00.png)
![](assets/2025-11-29-17-52-20.png)
(avec id incorrect)
![](assets/2025-11-29-17-53-02.png)
(avec id inexistant mais au bon format)

---

### Artistes (`/api/artistes`)

| Méthode | URL | Description | Corps JSON |
|---------|-----|-------------|------------|
| **GET** | `/api/artistes` | Liste tous les artistes | - |
| **GET** | `/api/artistes/:id` | Récupère un artiste par ID | - |
| **POST** | `/api/artistes` | Crée un nouvel artiste | Voir exemple ci-dessous |
| **PUT** | `/api/artistes/:id` | Modifie un artiste | Voir exemple ci-dessous |
| **DELETE** | `/api/artistes/:id` | Supprime un artiste | - |

![](assets/2025-11-29-17-54-31.png)
![](assets/2025-11-29-17-55-45.png)
![](assets/2025-11-29-17-55-59.png)
![](assets/2025-11-29-17-56-19.png)
![](assets/2025-11-29-17-56-35.png)

---

### Albums (`/api/albums`)

| Méthode | URL | Description | Corps JSON |
|---------|-----|-------------|------------|
| **GET** | `/api/albums` | Liste tous les albums (avec artiste et créateur) | - |
| **GET** | `/api/albums/:id` | Récupère un album par ID | - |
| **POST** | `/api/albums` | Crée un nouvel album | Voir exemple ci-dessous |
| **PUT** | `/api/albums/:id` | Modifie un album | Voir exemple ci-dessous |
| **DELETE** | `/api/albums/:id` | Supprime un album | - |
| **GET** | `/api/albums/:id/chansons` | Liste les chansons d'un album (triées par numéro) | - |
| **DELETE** | `/api/albums/:id/chansons/:chansonId` | Supprime une chanson d'un album | - |

![](assets/2025-11-29-18-21-55.png)
![](assets/2025-11-29-18-24-27.png)
![](assets/2025-11-29-18-24-53.png)
![](assets/2025-11-29-18-25-07.png)
![](assets/2025-11-29-18-25-26.png)

---

### Chansons (`/api/chansons`)

| Méthode | URL | Description | Corps JSON |
|---------|-----|-------------|------------|
| **GET** | `/api/chansons` | Liste toutes les chansons | - |
| **GET** | `/api/chansons/:id` | Récupère une chanson par ID | - |
| **POST** | `/api/chansons` | Crée une nouvelle chanson | Voir exemple ci-dessous |
| **PUT** | `/api/chansons/:id` | Modifie une chanson | Voir exemple ci-dessous |
| **DELETE** | `/api/chansons/:id` | Supprime une chanson | - |

![](assets/2025-11-29-18-39-55.png)
![](assets/2025-11-29-18-40-44.png)
![](assets/2025-11-29-18-41-08.png)
![](assets/2025-11-29-18-41-23.png)
![](assets/2025-11-29-18-41-43.png)
![](assets/2025-11-29-18-42-02.png)
![](assets/2025-11-29-18-42-55.png)

---

### Playlists (`/api/playlists`)

| Méthode | URL | Description | Corps JSON |
|---------|-----|-------------|------------|
| **GET** | `/api/playlists` | Liste toutes les playlists | - |
| **GET** | `/api/playlists/:id` | Récupère une playlist par ID | - |
| **POST** | `/api/playlists` | Crée une nouvelle playlist | Voir exemple ci-dessous |
| **PUT** | `/api/playlists/:id` | Modifie une playlist | Voir exemple ci-dessous |
| **DELETE** | `/api/playlists/:id` | Supprime une playlist | - |
| **GET** | `/api/playlists/:id/chansons` | Liste les chansons d'une playlist (triées par ordre) | - |
| **POST** | `/api/playlists/:id/chansons` | Ajoute une chanson à une playlist | Voir exemple ci-dessous |
| **DELETE** | `/api/playlists/:id/chansons/:chansonId` | Retire une chanson d'une playlist | - |

![](assets/2025-11-29-18-49-15.png)
![](assets/2025-11-29-18-49-54.png)
![](assets/2025-11-29-18-50-37.png)
![](assets/2025-11-29-18-50-50.png)
![](assets/2025-11-29-18-51-04.png)
![](assets/2025-11-29-18-51-20.png)
![](assets/2025-11-29-18-51-43.png)
![](assets/2025-11-29-18-51-58.png)
---

## Test automatisé Postman

**Comment l'importer et l'exécuter :**

1. **Importation** :
   - Ouvrir Postman
   - Cliquer sur **Import**
   - Glisser-déposer le fichier `Postman-test.json`
   - Confirmer l'importation

2. **Exécution avec Collection Runner** :
   - Cliquer sur la collection importée
   - Cliquer sur **Run**
   - Fenêtre Collection Runner s'ouvre
   - **Configuration** :
     - Vérifier que toutes les requêtes sont cochées
     - **Ordre important** : Ne pas modifier l'ordre des requêtes (1→16)
     - Delay : 0ms par défaut
   - Cliquer sur **Run Music API - Tests Automatisés**

3. **Déroulement** :
   - Les 16 requêtes s'exécutent séquentiellement
   - **Séquence** :
     1. Créer utilisateur (ID capturé automatiquement)
     2. Créer artiste (ID capturé)
     3. Créer album (utilise artiste_id et user_id)
     4. Créer chanson (utilise album_id)
     5. Créer playlist (utilise user_id)
     6. Ajouter chanson à playlist
     7. Tester GET chansons de l'album
     8. Tester GET chansons de la playlist
     9. Tester GET utilisateur par ID
     10. Modifier utilisateur
     11. Retirer chanson de la playlist
     12-16. Supprimer playlist, chanson, album, artiste, utilisateur

4. **Résultats** :
   - Onglet **Test Results** affiche les tests passés/échoués
   - Chaque requête a des assertions :
     - Vérification du status code (200, 201)
     - Validation de la structure de réponse
     - Capture automatique des IDs dans les variables

5. **Avantages** :
   - Tests automatisés de bout en bout
   - Validation complète de l'API
   - Pas besoin de saisir manuellement les IDs
   - Idéal pour tester après modifications du code

---


---

## 🚀 Démarrage du projet

---

## 6. Installation et déploiement

### 6.1 Prérequis système

L'exécution du projet nécessite les composants suivants :
- **Node.js** : Version 14 ou supérieure
- **MongoDB** : Instance active sur le port 27017
- **Postman** : Pour les tests fonctionnels de l'API (optionnel)

### 6.2 Procédure d'installationes dépendances** :
   ```bash
   npm install
   ```

3. **Démarrer MongoDB** :

4. **Lancer l'application** :
   
   **Mode production** :
   ```bash
   npm start
   ```
   
   **Mode développement** (avec rechargement automatique) :
   ```bash
   npm run dev
   ```

5. **Vérifier le démarrage** :
   - L'API est accessible sur `http://localhost:3005`
   - Ouvrir dans un navigateur : `http://localhost:3005/`
   - Vous devriez voir la documentation JSON de l'API

---

---

## 7. Analyse et discussion

### 7.1 Choix architecturaux

#### 7.1.1 Pattern MVC adapté
L'architecture implémentée s'inspire du pattern MVC classique tout en l'adaptant au contexte d'une API REST :
- **Modèles** : Définition des schémas de données via Mongoose avec validation intégrée
- **Contrôleurs** : Logique métier intégrée directement dans les fichiers de routes pour simplifier la structure
- **Vue** : Absente, remplacée par des réponses au format JSON conformément aux standards REST

Cette approche permet une séparation claire des rôles tout en maintenant une structure de projet compréhensible pour une application de taille moyenne.

#### 7.1.2 Modélisation des données

La modélisation relationelle adoptée répond aux contraintes suivantes :
- Relations **1:N** entre Artiste et Album, Album et Chanson, User et Playlist
- Relation **N:M** entre Playlist et Chanson via la table de jonction `PlaylistChanson`

Le choix d'une table de jonction avec attribut supplémentaire (`ordre`) permet de gérer l'ordonnancement des chansons dans les playlists, fonctionnalité essentielle pour ce type d'application.

### 7.2 Points forts de l'implémentation

#### 7.2.1 Flexibilité des entrées
L'API accepte les paramètres soit via query string, soit via corps de requête JSON. Cette double modalité facilite :
- Les tests rapides via navigateur ou outils simples (query params)
- L'intégration avec des clients JavaScript modernes (body JSON)

#### 7.2.2 Population des relations
L'utilisation systématique de la méthode `populate()` de Mongoose permet de récupérer les entités liées en une seule requête, évitant ainsi le problème N+1 queries fréquent dans les architectures REST.

#### 7.2.3 Gestion des erreurs
Chaque endpoint implémente un bloc try-catch garantissant une gestion cohérente des erreurs avec retour de messages explicites au client.

### 7.3 Fonctionnalités avancées

#### 7.3.1 Gestion intelligente de l'ordre dans les playlists
Le système d'ajout de chansons aux playlists implémente deux modes :
- **Mode automatique** : Si l'attribut `ordre` n'est pas fourni, le système calcule automatiquement la position suivante
- **Mode manuel** : L'utilisateur peut spécifier explicitement la position désirée

#### 7.3.2 Suppression contextuelle
La logique de suppression diffère selon le contexte :
- Suppression d'une chanson d'un **album** : suppression définitive de l'entité Chanson
- Suppression d'une chanson d'une **playlist** : suppression uniquement du lien dans la table de jonction

Cette distinction reflète la différence sémantique entre ces deux opérations.

---

## 8. Conclusion

Ce projet démontre l'implémentation d'une API REST fonctionnelle respectant les principes architecturaux modernes. L'architecture MVC adaptée, combinée à une modélisation relationnelle cohérente et à une gestion appropriée des erreurs, constitue une base solide pour une application de gestion musicale.

Les choix techniques effectués (Node.js, Express, MongoDB) correspondent aux standards actuels du développement backend et à la consigne en plus d'offrir un bon compromis entre performance, simplicité et évolutivité.

Les perspectives d'évolution permettant de transformer ce prototype en application production-ready,  sont notamment l'ajout de mécanismes d'authentification, de validation avancée et d'optimisations de performance.