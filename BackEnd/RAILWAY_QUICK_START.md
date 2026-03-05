# 🚂 Guide Rapide - Déploiement Railway

## ⚡ Déploiement en 5 Minutes

### 1. Créer le Projet Railway

1. Allez sur [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Sélectionnez votre repository
4. Railway détectera automatiquement Laravel

### 2. Ajouter la Base de Données

1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database"** → **"MySQL"**
3. Railway créera automatiquement les variables d'environnement

### 3. Configurer les Variables

Dans **Settings** → **Variables**, ajoutez :

```env
APP_NAME="Therapy Center"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-app.railway.app

DB_CONNECTION=mysql
DB_HOST=${MYSQL_HOST}
DB_PORT=${MYSQL_PORT}
DB_DATABASE=${MYSQL_DATABASE}
DB_USERNAME=${MYSQL_USER}
DB_PASSWORD=${MYSQL_PASSWORD}

JWT_SECRET= (générer après le premier déploiement)
JWT_TTL=60

STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...

FRONTEND_URL=https://votre-frontend.railway.app
```

### 4. Premier Déploiement

Railway va automatiquement :
- ✅ Installer les dépendances Composer
- ✅ Générer `APP_KEY`
- ✅ Démarrer le serveur PHP

### 5. Configurer la Base de Données

Après le premier déploiement, via Railway CLI :

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Se connecter
railway login

# Lier le projet
railway link

# Générer JWT_SECRET
railway run php artisan jwt:secret

# Exécuter les migrations
railway run php artisan migrate --force

# Exécuter les seeders (optionnel)
railway run php artisan db:seed --force

# Créer le lien storage
railway run php artisan storage:link
```

### 6. Obtenir l'URL de l'API

1. Dans Railway, allez dans **Settings** → **Networking**
2. Cliquez sur **"Generate Domain"**
3. Copiez l'URL (ex: `https://votre-app.railway.app`)

### 7. Mettre à Jour le Frontend

Dans votre frontend, mettez à jour `.env` :

```env
VITE_API_URL=https://votre-app.railway.app/api
```

Puis rebuildez et redéployez le frontend.

---

## 🐛 Problèmes Courants

### ❌ "APP_KEY not set"

```bash
railway run php artisan key:generate
```

### ❌ "Database connection failed"

Vérifiez que :
1. La base de données MySQL est créée dans Railway
2. Les variables `DB_*` utilisent `${MYSQL_HOST}`, etc.
3. La base de données est dans le même projet Railway

### ❌ "JWT_SECRET not set"

```bash
railway run php artisan jwt:secret
```

Puis ajoutez la valeur dans Railway → Variables → `JWT_SECRET`

### ❌ "CORS error"

Vérifiez que `FRONTEND_URL` est correct dans les variables d'environnement.

---

## 📝 Checklist Rapide

- [ ] Projet Railway créé
- [ ] Repository connecté
- [ ] Base de données MySQL ajoutée
- [ ] Variables d'environnement configurées
- [ ] Premier déploiement réussi
- [ ] JWT_SECRET généré
- [ ] Migrations exécutées
- [ ] URL API obtenue
- [ ] Frontend mis à jour avec la nouvelle URL

---

## 🔗 Fichiers Créés

- ✅ `railway.json` - Configuration Railway
- ✅ `Procfile` - Commande de démarrage
- ✅ `nixpacks.toml` - Configuration de build
- ✅ `DEPLOIEMENT_RAILWAY.md` - Guide complet
- ✅ `.railway.env.example` - Template de variables

---

**🎉 Votre backend est prêt pour Railway !**
