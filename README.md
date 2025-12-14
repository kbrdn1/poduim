# Poduim

Application web de gestion de tournois sportifs. Créez des tournois, ajoutez des équipes, générez automatiquement les matchs et suivez les résultats en temps réel.

## Stack technique

| Composant | Technologies |
|-----------|--------------|
| **Frontend** | Nuxt 3, Vue 3, TailwindCSS, Pinia, VueUse |
| **Backend** | Bun, Hono, Drizzle ORM, Zod |
| **Base de données** | MySQL 8.0 |
| **Monorepo** | Bun workspaces |
| **Conteneurisation** | Docker, Docker Compose |

## Démarrage rapide

```bash
# 1. Cloner et configurer
git clone <repository-url> && cd poduim && make setup

# 2. Installer les dépendances
make install

# 3. Lancer l'application
make dev
```

L'application sera disponible sur :
- **Frontend** : http://localhost:3001
- **API** : http://localhost:3000

## Variables d'environnement

### API (`packages/api/.env`)

```env
# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=poduim

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS
CORS_ORIGIN=http://localhost:3001

# Seed (development only)
SEED_ADMIN_PASSWORD=TestAdmin123!
SEED_USER_PASSWORD=TestUser123!
```

### Frontend (`packages/web/.env`)

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
```

## Utilisateurs de test

Après avoir lancé `bun db:seed`, les comptes suivants sont disponibles :

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| `admin@poduim.io` | `@Admin123` | Admin |
| `user1@poduim.io` | `@User123` | Viewer |
| `user2@poduim.io` | `@User123` | Viewer |

> Les mots de passe peuvent être modifiés via les variables `SEED_ADMIN_PASSWORD` et `SEED_USER_PASSWORD`.

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/auth/register` | Inscription | Non |
| `POST` | `/auth/login` | Connexion | Non |
| `GET` | `/auth/me` | Profil utilisateur | Oui |
| `PUT` | `/auth/me` | Modifier profil | Oui |
| `POST` | `/auth/change-password` | Changer mot de passe | Oui |
| `POST` | `/auth/refresh` | Rafraîchir token | Oui |

### Tournois

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/tournaments` | Liste des tournois | Non |
| `GET` | `/tournaments/:id` | Détails d'un tournoi | Non |
| `GET` | `/tournaments/:id/details` | Tournoi avec équipes et matchs | Non |
| `GET` | `/tournaments/:id/ranking` | Classement du tournoi | Non |
| `POST` | `/tournaments` | Créer un tournoi | Oui (Admin) |
| `PATCH` | `/tournaments/:id` | Modifier un tournoi | Oui (Admin) |
| `DELETE` | `/tournaments/:id` | Supprimer un tournoi | Oui (Admin) |

### Équipes

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/teams` | Liste des équipes | Non |
| `GET` | `/teams?tournamentId=:id` | Équipes d'un tournoi | Non |
| `GET` | `/teams/:id` | Détails d'une équipe | Non |
| `POST` | `/teams` | Créer une équipe | Oui (Admin) |
| `PATCH` | `/teams/:id` | Modifier une équipe | Oui (Admin) |
| `DELETE` | `/teams/:id` | Supprimer une équipe | Oui (Admin) |

### Matchs

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/matches` | Liste des matchs | Non |
| `GET` | `/matches?tournamentId=:id` | Matchs d'un tournoi | Non |
| `GET` | `/matches/:id` | Détails d'un match | Non |
| `POST` | `/matches` | Créer un match | Oui (Admin) |
| `POST` | `/matches/generate/:tournamentId` | Générer matchs (round-robin) | Oui (Admin) |
| `PATCH` | `/matches/:id` | Modifier un match | Oui (Admin) |
| `PUT` | `/matches/:id/score` | Mettre à jour le score | Oui (Admin) |
| `DELETE` | `/matches/:id` | Supprimer un match | Oui (Admin) |
| `DELETE` | `/matches/tournament/:id` | Supprimer tous les matchs | Oui (Admin) |

### Abonnements

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/subscriptions` | Mes abonnements | Oui |
| `POST` | `/subscriptions` | S'abonner à un tournoi | Oui |
| `DELETE` | `/subscriptions/:id` | Se désabonner | Oui |

## Commandes disponibles

```bash
# Développement
make dev              # Lance l'app avec Docker
bun run dev           # Lance sans Docker (API + Web en parallèle)
bun run dev:api       # Lance uniquement l'API
bun run dev:web       # Lance uniquement le frontend

# Base de données
bun db:push           # Synchronise le schéma
bun db:seed           # Insère les données de test

# Build
bun run build         # Build API et Web

# Tests
make test             # Lance les tests
bun run test          # Tests sans Docker
```

## Structure du projet

```
poduim/
├── packages/
│   ├── api/                 # Backend Hono
│   │   └── src/
│   │       ├── controllers/ # Routes API
│   │       ├── services/    # Logique métier
│   │       ├── repositories/# Accès données
│   │       ├── middleware/  # Auth, erreurs
│   │       ├── db/          # Schema, seed
│   │       └── validators/  # Validation Zod
│   ├── web/                 # Frontend Nuxt
│   │   └── src/
│   │       ├── pages/       # Routes Vue
│   │       ├── components/  # Composants UI
│   │       ├── composables/ # Hooks Vue
│   │       ├── stores/      # État Pinia
│   │       └── layouts/     # Layouts
│   └── shared/              # Types partagés
│       └── src/
│           ├── types/       # Interfaces TS
│           └── validators/  # Schémas Zod
├── docker-compose.local.yml # Config Docker
├── Makefile                 # Commandes utiles
└── README.md
```

## Fonctionnalités

### Admin
- Créer/modifier/supprimer des tournois
- Ajouter des équipes à un tournoi
- Générer automatiquement les matchs (round-robin)
- Saisir les scores des matchs
- Gérer le statut des tournois (Brouillon → Inscriptions → En cours → Terminé)

### Viewer
- Consulter la liste des tournois
- Voir le détail d'un tournoi (équipes, matchs, classement)
- S'abonner aux notifications de tournois

## Données de démo

Le seed inclut 3 ligues européennes avec équipes et matchs :
- **Ligue 1 McDonald's** (France) - 18 équipes
- **LaLiga EA Sports** (Espagne) - 8 équipes
- **Premier League** (Angleterre) - 8 équipes

## Licence

MIT
