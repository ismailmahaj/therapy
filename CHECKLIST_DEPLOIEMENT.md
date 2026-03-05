# ✅ Checklist de Déploiement en Production

## 🎯 Objectif
Vérifier que tout est prêt pour la mise en production du frontend et backend.

---

## 📋 BACKEND (Laravel)

### 1. Configuration de base

- [ ] **Fichier `.env` configuré**
  ```bash
  cd /var/www/html/BackEnd
  cp .env.example .env
  nano .env
  ```
  - [ ] `APP_ENV=production`
  - [ ] `APP_DEBUG=false`
  - [ ] `APP_URL=http://votre-domaine.com` (ou https://)
  - [ ] `APP_KEY` généré (`php artisan key:generate`)
  - [ ] Base de données configurée (DB_*)
  - [ ] `JWT_SECRET` configuré
  - [ ] `STRIPE_KEY` et `STRIPE_SECRET` configurés
  - [ ] `FRONTEND_URL` configuré pour CORS

- [ ] **Permissions**
  ```bash
  sudo chown -R www-data:www-data /var/www/html/BackEnd
  sudo chmod -R 755 /var/www/html/BackEnd
  sudo chmod -R 775 storage bootstrap/cache
  ```

- [ ] **Dépendances installées**
  ```bash
  composer install --optimize-autoloader --no-dev
  ```

- [ ] **Migrations exécutées**
  ```bash
  php artisan migrate --force
  ```

- [ ] **Optimisations Laravel**
  ```bash
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  php artisan storage:link
  ```

### 2. Configuration Apache

- [ ] **VirtualHost configuré**
  - [ ] DocumentRoot pointe vers `/var/www/html/BackEnd/public`
  - [ ] Ou Alias `/api` vers `/var/www/html/BackEnd/public`
  - [ ] `AllowOverride All` activé
  - [ ] `mod_rewrite` activé

- [ ] **Modules Apache activés**
  ```bash
  sudo a2enmod rewrite
  sudo a2enmod headers
  sudo apache2ctl configtest
  sudo systemctl restart apache2
  ```

### 3. Sécurité

- [ ] **CORS configuré** (`config/cors.php`)
  - [ ] `allowed_origins` contient l'URL du frontend
  - [ ] `supports_credentials` = true

- [ ] **Middleware CORS activé** (`bootstrap/app.php`)
  - [ ] `HandleCors` ajouté dans les middlewares API

- [ ] **Fichiers sensibles protégés**
  - [ ] `.env` non accessible publiquement
  - [ ] `storage/` et `bootstrap/cache/` protégés

### 4. Tests

- [ ] **Test de l'API**
  ```bash
  curl http://votre-domaine.com/api
  ```

- [ ] **Test d'une route protégée**
  ```bash
  curl -X POST http://votre-domaine.com/api/register \
    -H "Content-Type: application/json" \
    -d '{"first_name":"Test","last_name":"User","email":"test@test.com","sexe":"homme","password":"password123","password_confirmation":"password123","phone":"0123456789"}'
  ```

- [ ] **Vérification des logs**
  ```bash
  tail -f /var/www/html/BackEnd/storage/logs/laravel.log
  ```

---

## 🎨 FRONTEND (React)

### 1. Configuration de base

- [ ] **Fichier `.env` configuré**
  ```bash
  cd FrontEnd
  cp .env.example .env
  nano .env
  ```
  - [ ] `VITE_API_URL=http://votre-domaine.com/api` (ou https://)
  - [ ] `VITE_STRIPE_PUBLIC_KEY` configuré

- [ ] **Build de production**
  ```bash
  npm run build
  ```

- [ ] **Vérification du build**
  - [ ] Dossier `dist/` créé
  - [ ] Fichiers `.htaccess` et `_redirects` copiés dans `dist/`
  - [ ] Pas d'erreurs TypeScript
  - [ ] Pas d'erreurs de build

### 2. Déploiement

- [ ] **Fichiers uploadés**
  - [ ] Contenu de `dist/` uploadé vers `/var/www/html/`
  - [ ] `.htaccess` présent dans la racine
  - [ ] `_redirects` présent (si Netlify)

- [ ] **Permissions**
  ```bash
  sudo chown -R www-data:www-data /var/www/html
  sudo chmod -R 755 /var/www/html
  ```

### 3. Configuration Apache (Frontend)

- [ ] **VirtualHost configuré**
  - [ ] DocumentRoot pointe vers `/var/www/html`
  - [ ] `AllowOverride All` activé
  - [ ] RewriteRule pour SPA (toutes les routes vers `index.html`)

### 4. Tests

- [ ] **Test de l'accès**
  - [ ] Site accessible sur `http://votre-domaine.com`
  - [ ] Pas d'erreurs 404 pour les assets (JS, CSS)
  - [ ] Routing React fonctionne (navigation)

- [ ] **Test de l'API**
  - [ ] Connexion fonctionne
  - [ ] Les requêtes API partent vers la bonne URL
  - [ ] Pas d'erreurs CORS

---

## 🔒 SÉCURITÉ GLOBALE

### 1. HTTPS (Recommandé)

- [ ] **Certificat SSL configuré**
  ```bash
  sudo apt install certbot python3-certbot-apache
  sudo certbot --apache -d votre-domaine.com
  ```

- [ ] **Redirection HTTP → HTTPS**
  - [ ] Configurée dans Apache

### 2. Firewall

- [ ] **Ports ouverts**
  - [ ] 80 (HTTP)
  - [ ] 443 (HTTPS)
  - [ ] 22 (SSH)

- [ ] **Ports fermés**
  - [ ] 8000 (Laravel dev server)
  - [ ] 5173 (Vite dev server)

### 3. Base de données

- [ ] **Utilisateur MySQL sécurisé**
  - [ ] Mot de passe fort
  - [ ] Privilèges limités

- [ ] **Sauvegarde configurée**
  - [ ] Script de sauvegarde automatique
  - [ ] Test de restauration effectué

---

## 🧪 TESTS FINAUX

### 1. Tests fonctionnels

- [ ] **Authentification**
  - [ ] Inscription fonctionne
  - [ ] Vérification email fonctionne
  - [ ] Connexion fonctionne
  - [ ] Déconnexion fonctionne

- [ ] **Rendez-vous (Client)**
  - [ ] Liste des thérapeutes
  - [ ] Création de rendez-vous
  - [ ] Paiement (simulation)
  - [ ] Annulation

- [ ] **Gestion créneaux (Thérapeute)**
  - [ ] Création de créneaux
  - [ ] Visualisation calendrier
  - [ ] Gestion des rendez-vous

- [ ] **Donations**
  - [ ] Liste des projets
  - [ ] Contribution unique
  - [ ] Contribution multiple
  - [ ] Historique

### 2. Tests de performance

- [ ] **Temps de chargement**
  - [ ] Page d'accueil < 3s
  - [ ] API responses < 500ms

- [ ] **Assets optimisés**
  - [ ] JS minifiés
  - [ ] CSS minifiés
  - [ ] Images optimisées

### 3. Tests de compatibilité

- [ ] **Navigateurs**
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

- [ ] **Appareils**
  - [ ] Desktop
  - [ ] Mobile
  - [ ] Tablette

---

## 📝 DOCUMENTATION

- [ ] **Variables d'environnement documentées**
- [ ] **URLs de production documentées**
- [ ] **Procédure de déploiement documentée**
- [ ] **Procédure de rollback documentée**

---

## 🚨 EN CAS DE PROBLÈME

### Logs à vérifier

```bash
# Logs Apache
sudo tail -f /var/log/apache2/error.log
sudo tail -f /var/log/apache2/access.log

# Logs Laravel
tail -f /var/www/html/BackEnd/storage/logs/laravel.log

# Logs système
sudo journalctl -u apache2 -f
```

### Commandes de dépannage

```bash
# Nettoyer les caches Laravel
cd /var/www/html/BackEnd
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Recréer les caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Vérifier les permissions
ls -la /var/www/html/BackEnd/storage
ls -la /var/www/html/BackEnd/bootstrap/cache

# Tester la configuration Apache
sudo apache2ctl configtest
```

---

## ✅ VALIDATION FINALE

- [ ] Tous les tests passent
- [ ] Aucune erreur dans les logs
- [ ] Site accessible publiquement
- [ ] API fonctionnelle
- [ ] Sécurité vérifiée
- [ ] Performance acceptable

---

**🎉 Prêt pour la production !**
