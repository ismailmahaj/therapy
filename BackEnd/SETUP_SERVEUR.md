# 🚀 Configuration Laravel sur Ubuntu Server

## Étape 1 : Permissions

```bash
cd /var/www/html/BackEnd

# Définir le propriétaire
sudo chown -R www-data:www-data /var/www/html/BackEnd

# Permissions générales
sudo chmod -R 755 /var/www/html/BackEnd

# Permissions pour storage et cache (écriture nécessaire)
sudo chmod -R 775 /var/www/html/BackEnd/storage
sudo chmod -R 775 /var/www/html/BackEnd/bootstrap/cache
```

## Étape 2 : Configuration .env

```bash
cd /var/www/html/BackEnd

# Si .env n'existe pas, copier depuis .env.example
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

# Générer la clé d'application
php artisan key:generate

# Éditer le fichier .env
nano .env
```

**Configuration minimale dans `.env` :**

```env
APP_NAME="Therapy Center"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://votre-domaine.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nom_de_votre_base
DB_USERNAME=votre_user
DB_PASSWORD=votre_password
```

## Étape 3 : Installer les dépendances

```bash
cd /var/www/html/BackEnd

# Installer Composer si pas déjà installé
# curl -sS https://getcomposer.org/installer | php
# sudo mv composer.phar /usr/local/bin/composer

# Installer les dépendances
composer install --optimize-autoloader --no-dev
```

## Étape 4 : Migrations

```bash
cd /var/www/html/BackEnd

# Exécuter les migrations
php artisan migrate --force
```

## Étape 5 : Configuration Apache

### Option A : API sur sous-route `/api` (Recommandé)

Créez/modifiez le fichier de configuration Apache :

```bash
sudo nano /etc/apache2/sites-available/000-default.conf
```

**Configuration complète :**

```apache
<VirtualHost *:80>
    ServerName votre-domaine.com
    DocumentRoot /var/www/html
    
    # Frontend React
    <Directory /var/www/html>
        AllowOverride All
        Require all granted
        Options -Indexes +FollowSymLinks
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Backend Laravel API - Sous-route /api
    Alias /api /var/www/html/BackEnd/public
    
    <Directory /var/www/html/BackEnd/public>
        AllowOverride All
        Require all granted
        Options -Indexes +FollowSymLinks
        
        RewriteEngine On
        RewriteBase /api
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ /api/index.php [L]
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

### Option B : API sur sous-domaine séparé

```bash
sudo nano /etc/apache2/sites-available/api.conf
```

```apache
<VirtualHost *:80>
    ServerName api.votre-domaine.com
    DocumentRoot /var/www/html/BackEnd/public
    
    <Directory /var/www/html/BackEnd/public>
        AllowOverride All
        Require all granted
        Options -Indexes +FollowSymLinks
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/api_error.log
    CustomLog ${APACHE_LOG_DIR}/api_access.log combined
</VirtualHost>
```

Puis activez le site :
```bash
sudo a2ensite api.conf
```

## Étape 6 : Activer les modules Apache

```bash
# Activer mod_rewrite (essentiel pour Laravel)
sudo a2enmod rewrite

# Activer mod_headers (pour CORS)
sudo a2enmod headers

# Tester la configuration
sudo apache2ctl configtest

# Redémarrer Apache
sudo systemctl restart apache2
```

## Étape 7 : Optimiser Laravel

```bash
cd /var/www/html/BackEnd

# Cache de configuration
php artisan config:cache

# Cache des routes
php artisan route:cache

# Cache des vues
php artisan view:cache
```

## Étape 8 : Créer le lien symbolique pour storage

```bash
cd /var/www/html/BackEnd

# Créer le lien symbolique pour les fichiers publics
php artisan storage:link
```

## Étape 9 : Tester l'API

```bash
# Test de base
curl http://votre-domaine.com/api

# Test d'une route spécifique
curl http://votre-domaine.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","email":"test@test.com","sexe":"homme","password":"password123","password_confirmation":"password123"}'
```

## Étape 10 : Mettre à jour le frontend

Dans votre frontend, mettez à jour l'URL de l'API :

```typescript
// FrontEnd/src/constants/config.ts ou similaire
export const API_BASE_URL = 'http://votre-domaine.com/api';
```

## Vérification

### Vérifier les permissions

```bash
ls -la /var/www/html/BackEnd/storage
ls -la /var/www/html/BackEnd/bootstrap/cache
```

Les dossiers doivent être accessibles en écriture (775).

### Vérifier les logs

```bash
# Logs Apache
sudo tail -f /var/log/apache2/error.log

# Logs Laravel
tail -f /var/www/html/BackEnd/storage/logs/laravel.log
```

### Vérifier que Laravel fonctionne

```bash
# Test simple
curl -I http://votre-domaine.com/api

# Devrait retourner HTTP/1.1 200 OK ou 404 (normal si pas de route racine)
```

## Problèmes courants

### Erreur 500 - Internal Server Error

1. **Vérifier les permissions :**
```bash
sudo chmod -R 775 /var/www/html/BackEnd/storage
sudo chmod -R 775 /var/www/html/BackEnd/bootstrap/cache
```

2. **Vérifier les logs :**
```bash
tail -f /var/www/html/BackEnd/storage/logs/laravel.log
```

3. **Vérifier .env :**
```bash
php artisan config:clear
php artisan config:cache
```

### Erreur 404 sur les routes API

1. **Vérifier mod_rewrite :**
```bash
apache2ctl -M | grep rewrite
```

2. **Vérifier .htaccess :**
```bash
cat /var/www/html/BackEnd/public/.htaccess
```

3. **Vérifier la configuration Apache :**
```bash
sudo apache2ctl configtest
```

### Erreur "No application encryption key"

```bash
cd /var/www/html/BackEnd
php artisan key:generate
php artisan config:cache
```

### Erreur CORS

Vérifier `config/cors.php` et s'assurer que les origines sont correctes.

## Commandes utiles

```bash
# Nettoyer tous les caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Recréer les caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Voir toutes les routes
php artisan route:list

# Vérifier la configuration
php artisan config:show
```

## Sécurité

1. **APP_DEBUG=false** en production
2. **Permissions** : storage et bootstrap/cache en 775
3. **.env** : Ne jamais commiter
4. **HTTPS** : Configurer SSL avec Let's Encrypt
5. **Firewall** : Limiter l'accès

## Script automatique

Vous pouvez utiliser le script `setup-production.sh` :

```bash
cd /var/www/html/BackEnd
sudo bash setup-production.sh
```
