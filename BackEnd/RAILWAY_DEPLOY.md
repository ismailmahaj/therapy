# 🚂 Guide de Déploiement Railway - Backend Laravel

## ✅ Configuration effectuée

Le projet est maintenant configuré pour utiliser **Docker** sur Railway au lieu de Nixpacks.

## 📋 Étapes de déploiement

### 1. Créer un nouveau projet sur Railway

1. Allez sur [railway.app](https://railway.app)
2. Cliquez sur **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"** (ou upload direct)
4. Choisissez votre repository **BackEnd**

### 2. Configurer le service

Railway détectera automatiquement le `Dockerfile` grâce à `railway.json`.

**Important** : Assurez-vous que :
- Le **Root Directory** est défini sur `/` (racine du repo BackEnd)
- Le **Builder** est défini sur **DOCKERFILE** (automatique avec railway.json)

### 3. Ajouter une base de données MySQL

1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database"** → **"MySQL"**
3. Railway créera automatiquement les variables d'environnement :
   - `MYSQL_HOST`
   - `MYSQL_DATABASE`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_PORT`

### 4. Configurer les variables d'environnement

Dans les **Settings** de votre service backend, ajoutez ces variables dans **Variables** :

#### Variables obligatoires

```env
# Application
APP_NAME="Hijama Therapy Center"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-backend.up.railway.app

# Base de données (utilisez les variables MySQL de Railway)
DB_CONNECTION=mysql
DB_HOST=${{MySQL.MYSQL_HOST}}
DB_PORT=${{MySQL.MYSQL_PORT}}
DB_DATABASE=${{MySQL.MYSQL_DATABASE}}
DB_USERNAME=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}

# JWT
JWT_SECRET=votre_secret_jwt_aleatoire_long
JWT_TTL=60

# Stripe (si utilisé)
STRIPE_KEY=pk_live_votre_cle_publique
STRIPE_SECRET=sk_live_votre_cle_secrete

# Frontend URL (pour CORS)
FRONTEND_URL=https://votre-frontend.up.railway.app

# Migrations (optionnel)
RUN_MIGRATIONS=true
```

#### Variables optionnelles

```env
# Mail (si vous utilisez l'envoi d'emails)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=votre_username
MAIL_PASSWORD=votre_password
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@hijama.com"
MAIL_FROM_NAME="Hijama Therapy Center"

# Cache
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

# Redis (si vous ajoutez Redis)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
REDIS_PORT=${{Redis.REDIS_PORT}}
```

### 5. Générer les clés

**APP_KEY** et **JWT_SECRET** seront générés automatiquement par le script `docker-entrypoint.sh` si elles n'existent pas.

Pour générer manuellement :

```bash
# APP_KEY (généré automatiquement)
# JWT_SECRET (généré automatiquement)
```

### 6. Déployer

1. Railway détectera automatiquement le `Dockerfile`
2. Le build commencera automatiquement
3. Les migrations s'exécuteront automatiquement si `RUN_MIGRATIONS=true`

### 7. Vérifier le déploiement

Une fois déployé, testez :

```bash
# Health check
curl https://votre-backend.up.railway.app/health

# Devrait retourner: healthy
```

## 🔧 Dépannage

### Erreur : "Cannot connect to database"

**Solution** :
1. Vérifiez que la base de données MySQL est bien créée
2. Vérifiez que les variables `DB_*` pointent vers la bonne base de données
3. Attendez 30-60 secondes après la création de la base de données

### Erreur : "APP_KEY not set"

**Solution** : Le script génère automatiquement la clé. Si l'erreur persiste :
1. Ajoutez manuellement `APP_KEY=` dans les variables d'environnement
2. Railway générera la clé au démarrage

### Erreur : "Port already in use"

**Solution** : Railway gère automatiquement le port via `$PORT`. Vérifiez que vous n'avez pas défini de port fixe.

### Erreur : "Permission denied" sur storage

**Solution** : Les permissions sont configurées automatiquement dans le Dockerfile. Si l'erreur persiste :
1. Vérifiez les logs Railway
2. Le script `docker-entrypoint.sh` ajuste automatiquement les permissions

### Build échoue : "Extension PHP not found"

**Solution** : Toutes les extensions nécessaires sont dans le Dockerfile. Si une extension manque :
1. Ajoutez-la dans le Dockerfile
2. Rebuild le service

## 📝 Notes importantes

1. **Port dynamique** : Railway utilise `$PORT` automatiquement. Nginx est configuré pour l'utiliser.

2. **Migrations** : Les migrations s'exécutent automatiquement au démarrage si `RUN_MIGRATIONS=true`. Pour les désactiver, mettez `RUN_MIGRATIONS=false`.

3. **Logs** : Consultez les logs dans Railway Dashboard → Service → Logs

4. **Redéploiement** : Après chaque modification du code, Railway redéploie automatiquement si connecté à GitHub.

5. **Base de données** : Railway crée automatiquement les variables d'environnement pour MySQL. Utilisez la syntaxe `${{MySQL.MYSQL_HOST}}` pour y accéder.

## 🚀 Commandes utiles Railway CLI

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Se connecter
railway login

# Lier le projet
railway link

# Voir les logs
railway logs

# Ouvrir le shell du conteneur
railway shell

# Voir les variables d'environnement
railway variables
```

## ✅ Checklist de déploiement

- [ ] Projet Railway créé
- [ ] Service backend configuré avec Dockerfile
- [ ] Base de données MySQL ajoutée
- [ ] Variables d'environnement configurées
- [ ] `APP_URL` pointe vers l'URL Railway
- [ ] `FRONTEND_URL` pointe vers le frontend
- [ ] `DB_*` variables pointent vers MySQL Railway
- [ ] Build réussi
- [ ] Health check répond "healthy"
- [ ] Migrations exécutées
- [ ] API accessible depuis le frontend

---

**Besoin d'aide ?** Consultez les logs Railway ou ouvrez une issue sur GitHub.
