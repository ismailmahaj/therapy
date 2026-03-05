# 🚂 Déploiement Laravel sur Railway - Résumé

## 📁 Fichiers Créés pour Railway

1. **`railway.json`** - Configuration Railway (optionnel)
2. **`Procfile`** - Commande de démarrage
3. **`nixpacks.toml`** - Configuration de build Nixpacks (priorité)
4. **`.railway.env.example`** - Template des variables d'environnement
5. **`railway-setup.sh`** - Script de configuration initiale
6. **`DEPLOIEMENT_RAILWAY.md`** - Guide complet détaillé
7. **`RAILWAY_QUICK_START.md`** - Guide rapide en 5 minutes

## 🚀 Démarrage Rapide

### Étape 1 : Connecter le Repository

1. Allez sur [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Sélectionnez votre repository avec le dossier `BackEnd`

### Étape 2 : Configurer le Root Directory

Si votre repository contient plusieurs dossiers (FrontEnd, BackEnd, Mobile) :

1. Dans Railway, allez dans **Settings** → **Source**
2. Définissez **Root Directory** : `BackEnd`

### Étape 3 : Ajouter la Base de Données

1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database"** → **"MySQL"**
3. Railway créera automatiquement les variables :
   - `MYSQL_HOST`
   - `MYSQL_DATABASE`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_PORT`

### Étape 4 : Variables d'Environnement

Dans **Settings** → **Variables**, ajoutez :

```env
APP_NAME="Therapy Center"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-app.railway.app

# Base de données (utilisez les variables générées par Railway)
DB_CONNECTION=mysql
DB_HOST=${MYSQL_HOST}
DB_PORT=${MYSQL_PORT}
DB_DATABASE=${MYSQL_DATABASE}
DB_USERNAME=${MYSQL_USER}
DB_PASSWORD=${MYSQL_PASSWORD}

# JWT (générer après le premier déploiement)
JWT_SECRET=
JWT_TTL=60

# Stripe
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...

# CORS
FRONTEND_URL=https://votre-frontend.railway.app
```

### Étape 5 : Premier Déploiement

Railway va automatiquement :
- ✅ Détecter que c'est un projet Laravel
- ✅ Installer PHP 8.2 et Composer
- ✅ Exécuter `composer install --optimize-autoloader --no-dev`
- ✅ Générer `APP_KEY` (si pas défini)
- ✅ Démarrer le serveur PHP

### Étape 6 : Configuration Post-Déploiement

Après le premier déploiement réussi, via Railway CLI :

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Se connecter
railway login

# Lier le projet (dans le dossier BackEnd)
cd BackEnd
railway link

# Générer JWT_SECRET
railway run php artisan jwt:secret

# Copier la valeur générée et ajoutez-la dans Railway → Variables → JWT_SECRET

# Exécuter les migrations
railway run php artisan migrate --force

# Exécuter les seeders (optionnel)
railway run php artisan db:seed --force

# Créer le lien storage
railway run php artisan storage:link
```

### Étape 7 : Obtenir l'URL

1. Dans Railway, allez dans **Settings** → **Networking**
2. Cliquez sur **"Generate Domain"**
3. Copiez l'URL (ex: `https://votre-app.up.railway.app`)

### Étape 8 : Mettre à Jour le Frontend

Dans votre frontend Railway, mettez à jour les variables :

```env
VITE_API_URL=https://votre-app.up.railway.app/api
```

---

## 🔧 Configuration Avancée

### Root Directory

Si votre repository contient plusieurs projets :

1. **Settings** → **Source** → **Root Directory**
2. Définissez : `BackEnd`

### Variables d'Environnement Sensibles

Pour les secrets (JWT_SECRET, STRIPE_SECRET) :

1. **Settings** → **Variables**
2. Ajoutez la variable
3. Cochez **"Encrypt"** pour les secrets

### Health Check

Railway vérifie automatiquement `/up` (route Laravel par défaut).

### Logs

- **Interface Web** : Deployments → View Logs
- **CLI** : `railway logs`

---

## 🐛 Dépannage

### Erreur : "APP_KEY not set"

```bash
railway run php artisan key:generate
```

Puis ajoutez la valeur dans Railway → Variables.

### Erreur : "Database connection failed"

1. Vérifiez que MySQL est créé dans Railway
2. Vérifiez les variables `DB_*` utilisent `${MYSQL_*}` 
3. Vérifiez que la base est dans le même projet

### Erreur : "JWT_SECRET not set"

```bash
railway run php artisan jwt:secret
```

Puis ajoutez dans Railway → Variables.

### Erreur : "CORS policy"

1. Vérifiez `FRONTEND_URL` dans les variables
2. Vérifiez `config/cors.php` contient cette origine

### Erreur : "Permission denied" (storage)

Les permissions sont gérées automatiquement dans `nixpacks.toml`.

---

## 📝 Checklist

- [ ] Repository connecté à Railway
- [ ] Root Directory configuré (`BackEnd`)
- [ ] Base de données MySQL créée
- [ ] Variables d'environnement configurées
- [ ] Premier déploiement réussi
- [ ] `APP_KEY` généré
- [ ] `JWT_SECRET` généré
- [ ] Migrations exécutées
- [ ] Storage link créé
- [ ] URL API obtenue
- [ ] Frontend mis à jour

---

## 🔗 Ressources

- **Guide Complet** : `DEPLOIEMENT_RAILWAY.md`
- **Guide Rapide** : `RAILWAY_QUICK_START.md`
- **Template Variables** : `.railway.env.example`

---

**✅ Votre backend Laravel est maintenant prêt pour Railway !**
