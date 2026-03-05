# 🚂 Déploiement Laravel sur Railway

## 📋 Prérequis

1. Compte Railway créé
2. Projet Railway créé
3. Base de données MySQL/PostgreSQL ajoutée au projet Railway

---

## 🚀 Étapes de Déploiement

### 1. Connecter votre Repository

1. Allez sur [Railway](https://railway.app)
2. Cliquez sur **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"** (ou GitLab/Bitbucket)
4. Choisissez votre repository
5. Railway détectera automatiquement que c'est un projet Laravel

### 2. Configuration de la Base de Données

1. Dans votre projet Railway, cliquez sur **"+ New"**
2. Sélectionnez **"Database"** → **"MySQL"** (ou PostgreSQL)
3. Railway créera automatiquement les variables d'environnement :
   - `MYSQL_HOST` (ou `DATABASE_URL`)
   - `MYSQL_DATABASE`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_PORT`

### 3. Variables d'Environnement

Dans les **Settings** de votre service Laravel, ajoutez ces variables :

#### Variables Obligatoires

```env
# Application
APP_NAME="Therapy Center"
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:... (généré automatiquement par Railway)
APP_URL=https://votre-app.railway.app

# Base de données (Railway les génère automatiquement)
DB_CONNECTION=mysql
DB_HOST=${MYSQL_HOST}
DB_PORT=${MYSQL_PORT}
DB_DATABASE=${MYSQL_DATABASE}
DB_USERNAME=${MYSQL_USER}
DB_PASSWORD=${MYSQL_PASSWORD}

# JWT
JWT_SECRET= (générer avec: php artisan jwt:secret)
JWT_TTL=60

# Stripe
STRIPE_KEY=pk_live_... (ou pk_test_...)
STRIPE_SECRET=sk_live_... (ou sk_test_...)

# CORS - URL de votre frontend
FRONTEND_URL=https://votre-frontend.railway.app
```

#### Variables Optionnelles

```env
# Mail (si vous utilisez l'envoi d'emails)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@therapycenter.com
MAIL_FROM_NAME="${APP_NAME}"

# Cache
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

### 4. Configuration du Build

Railway utilisera automatiquement les fichiers :
- `nixpacks.toml` (priorité)
- `railway.json`
- `Procfile`

**Les fichiers sont déjà créés dans le projet !**

### 5. Script de Déploiement Automatique

Railway exécutera automatiquement :

1. **Build** :
   ```bash
   composer install --optimize-autoloader --no-dev
   php artisan key:generate --force
   ```

2. **Démarrage** :
   ```bash
   php artisan serve --host=0.0.0.0 --port=$PORT
   ```

### 6. Migrations et Seeders

#### Option 1 : Via Railway CLI (Recommandé)

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Se connecter
railway login

# Lier le projet
railway link

# Exécuter les migrations
railway run php artisan migrate --force

# Exécuter les seeders (optionnel)
railway run php artisan db:seed --force
```

#### Option 2 : Via Script de Build

Ajoutez dans `nixpacks.toml` :

```toml
[phases.build]
cmds = [
  "php artisan key:generate --force || true",
  "php artisan config:cache || true",
  "php artisan route:cache || true",
  "php artisan view:cache || true",
  "php artisan migrate --force || true"
]
```

⚠️ **Attention** : Les migrations s'exécuteront à chaque déploiement. Utilisez `|| true` pour éviter les erreurs si déjà exécutées.

### 7. Storage Public

Pour que les fichiers publics soient accessibles, créez un lien symbolique :

```bash
railway run php artisan storage:link
```

Ou ajoutez dans le script de build :

```toml
[phases.build]
cmds = [
  # ... autres commandes
  "php artisan storage:link || true"
]
```

---

## 🔧 Configuration Avancée

### Health Check

Railway vérifie automatiquement la santé de l'application via `/up` (route Laravel par défaut).

### Port Dynamique

Railway fournit automatiquement la variable `$PORT`. Le serveur PHP écoute sur ce port.

### Logs

Les logs sont accessibles dans l'interface Railway :
- **Deployments** → Cliquez sur un déploiement → **View Logs**

### Variables d'Environnement Sensibles

Pour les secrets (JWT_SECRET, STRIPE_SECRET), utilisez les **Variables** dans Railway :
1. Settings → Variables
2. Ajoutez vos variables
3. Cochez **"Encrypt"** pour les secrets

---

## 🐛 Dépannage

### Erreur : "APP_KEY not set"

```bash
# Via Railway CLI
railway run php artisan key:generate

# Ou ajoutez dans les variables d'environnement
APP_KEY=base64:... (généré localement)
```

### Erreur : "Database connection failed"

1. Vérifiez que la base de données est créée dans Railway
2. Vérifiez les variables `DB_*` dans les Settings
3. Vérifiez que la base de données est dans le même projet Railway

### Erreur : "Permission denied" (storage)

```bash
railway run chmod -R 775 storage bootstrap/cache
```

Ou ajoutez dans `nixpacks.toml` :

```toml
[phases.build]
cmds = [
  # ... autres commandes
  "chmod -R 775 storage bootstrap/cache || true"
]
```

### Erreur : "Route not found"

1. Vérifiez que les routes sont cachées :
   ```bash
   railway run php artisan route:cache
   ```

2. Vérifiez que `APP_URL` est correct dans les variables d'environnement

### Erreur : "CORS policy"

1. Vérifiez `FRONTEND_URL` dans les variables d'environnement
2. Vérifiez `config/cors.php` :
   ```php
   'allowed_origins' => [
       env('FRONTEND_URL', 'http://localhost:5173'),
   ],
   ```

### Voir les Logs

```bash
# Via Railway CLI
railway logs

# Ou dans l'interface web
# Deployments → View Logs
```

---

## 📝 Checklist de Déploiement

- [ ] Repository connecté à Railway
- [ ] Base de données MySQL/PostgreSQL créée
- [ ] Variables d'environnement configurées
- [ ] `APP_KEY` généré
- [ ] `JWT_SECRET` généré
- [ ] `STRIPE_KEY` et `STRIPE_SECRET` configurés
- [ ] `FRONTEND_URL` configuré
- [ ] Migrations exécutées
- [ ] Storage link créé
- [ ] Test de l'API réussi
- [ ] CORS configuré correctement

---

## 🔗 URLs Importantes

- **API Backend** : `https://votre-app.railway.app`
- **API Routes** : `https://votre-app.railway.app/api`
- **Health Check** : `https://votre-app.railway.app/up`

---

## 🎯 Mise à Jour du Frontend

Une fois le backend déployé, mettez à jour votre frontend :

```env
# FrontEnd/.env
VITE_API_URL=https://votre-app.railway.app/api
```

Puis rebuildez et redéployez le frontend.

---

## ✅ Test Final

```bash
# Tester l'API
curl https://votre-app.railway.app/api

# Tester une route protégée
curl -X POST https://votre-app.railway.app/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@test.com",
    "sexe": "homme",
    "password": "password123",
    "password_confirmation": "password123",
    "phone": "0123456789"
  }'
```

---

**🎉 Votre backend Laravel est maintenant déployé sur Railway !**
