# 🚀 Configuration Apache pour Laravel

## Structure actuelle

D'après votre `ls -all`, vous avez :
```
/var/www/html/
├── BackEnd/          # Votre projet Laravel
├── assets/           # Assets du frontend
├── index.html        # Frontend React
└── _redirects        # Configuration Netlify
```

## Configuration Apache requise

### 1. Créer un VirtualHost pour Laravel

Créez un fichier de configuration Apache :

```bash
sudo nano /etc/apache2/sites-available/laravel.conf
```

**Contenu du fichier :**

```apache
<VirtualHost *:80>
    ServerName api.votre-domaine.com
    # Ou utilisez une sous-route : ServerName votre-domaine.com/api
    
    DocumentRoot /var/www/html/BackEnd/public
    
    <Directory /var/www/html/BackEnd/public>
        AllowOverride All
        Require all granted
        Options -Indexes +FollowSymLinks
    </Directory>
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/laravel_error.log
    CustomLog ${APACHE_LOG_DIR}/laravel_access.log combined
</VirtualHost>
```

**OU si vous voulez utiliser une sous-route (recommandé) :**

```apache
<VirtualHost *:80>
    ServerName votre-domaine.com
    DocumentRoot /var/www/html
    
    # Frontend React
    <Directory /var/www/html>
        AllowOverride All
        Require all granted
        Options -Indexes +FollowSymLinks
        
        # Redirection pour React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Backend Laravel API
    Alias /api /var/www/html/BackEnd/public
    
    <Directory /var/www/html/BackEnd/public>
        AllowOverride All
        Require all granted
        Options -Indexes +FollowSymLinks
        
        # Redirection Laravel
        RewriteEngine On
        RewriteBase /api
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule ^ /api/index.php [L]
    </Directory>
    
    # Logs
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
```

### 2. Activer le site

```bash
# Activer le site
sudo a2ensite laravel.conf

# Ou si vous utilisez la configuration par défaut
sudo a2ensite 000-default.conf

# Désactiver le site par défaut si nécessaire
sudo a2dissite 000-default

# Activer mod_rewrite (déjà fait normalement)
sudo a2enmod rewrite

# Tester la configuration
sudo apache2ctl configtest

# Redémarrer Apache
sudo systemctl restart apache2
```

## Configuration Laravel

### 1. Permissions

```bash
cd /var/www/html/BackEnd

# Propriétaire et groupe
sudo chown -R www-data:www-data /var/www/html/BackEnd

# Permissions
sudo chmod -R 755 /var/www/html/BackEnd
sudo chmod -R 775 /var/www/html/BackEnd/storage
sudo chmod -R 775 /var/www/html/BackEnd/bootstrap/cache
```

### 2. Fichier .env

```bash
cd /var/www/html/BackEnd

# Copier .env.example si .env n'existe pas
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Éditer .env
nano .env
```

**Configuration minimale dans `.env` :**

```env
APP_NAME="Therapy Center"
APP_ENV=production
APP_KEY=base64:... (généré par key:generate)
APP_DEBUG=false
APP_URL=http://votre-domaine.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nom_de_votre_base
DB_USERNAME=votre_user
DB_PASSWORD=votre_password

# Si vous utilisez une sous-route pour l'API
# Sinon, laissez vide si l'API est sur un sous-domaine
APP_URL=http://votre-domaine.com
```

### 3. Installer les dépendances

```bash
cd /var/www/html/BackEnd

# Installer les dépendances Composer
composer install --optimize-autoloader --no-dev

# Ou si vous n'avez pas encore installé
composer install --no-dev
```

### 4. Migrations et seeders

```bash
# Exécuter les migrations
php artisan migrate --force

# Optionnel : Exécuter les seeders
php artisan db:seed --force
```

### 5. Optimiser Laravel pour la production

```bash
# Cache de configuration
php artisan config:cache

# Cache des routes
php artisan route:cache

# Cache des vues
php artisan view:cache

# Optimiser l'autoloader
composer install --optimize-autoloader --no-dev
```

## Configuration CORS

Si votre frontend est sur un autre domaine/sous-domaine, configurez CORS :

```bash
nano /var/www/html/BackEnd/config/cors.php
```

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],

'allowed_methods' => ['*'],

'allowed_origins' => [
    'http://votre-domaine.com',
    'https://votre-domaine.com',
],

'allowed_headers' => ['*'],

'supports_credentials' => true,
```

## Test de l'API

### Test simple

```bash
# Tester que Laravel répond
curl http://votre-domaine.com/api

# Ou si sur sous-domaine
curl http://api.votre-domaine.com
```

### Test depuis le frontend

Dans `FrontEnd/src/utils/api.ts` ou votre fichier de configuration API :

```typescript
export const API_BASE_URL = 'http://votre-domaine.com/api';
// Ou
export const API_BASE_URL = 'http://api.votre-domaine.com/api';
```

## Vérification

### 1. Vérifier les permissions

```bash
ls -la /var/www/html/BackEnd/storage
ls -la /var/www/html/BackEnd/bootstrap/cache
```

Doivent être accessibles en écriture (775).

### 2. Vérifier les logs

```bash
# Logs Apache
sudo tail -f /var/log/apache2/error.log

# Logs Laravel
tail -f /var/www/html/BackEnd/storage/logs/laravel.log
```

### 3. Tester l'API

```bash
# Test de base
curl http://votre-domaine.com/api

# Test d'une route spécifique
curl http://votre-domaine.com/api/register \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

## Problèmes courants

### Erreur 500

1. Vérifier les permissions : `sudo chmod -R 775 storage bootstrap/cache`
2. Vérifier les logs : `tail -f storage/logs/laravel.log`
3. Vérifier `.env` : `php artisan config:clear`

### Erreur 404 sur les routes API

1. Vérifier que `mod_rewrite` est activé : `apache2ctl -M | grep rewrite`
2. Vérifier `.htaccess` dans `public/`
3. Vérifier la configuration Apache

### Erreur CORS

1. Vérifier `config/cors.php`
2. Vérifier que les origines sont correctes
3. Vérifier les headers dans les requêtes

## Commandes utiles

```bash
# Nettoyer les caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# Recréer les caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Vérifier la configuration
php artisan config:show
php artisan route:list
```

## Sécurité

1. **APP_DEBUG=false** en production
2. **Permissions** : storage et bootstrap/cache en 775
3. **.env** : Ne jamais commiter ce fichier
4. **HTTPS** : Configurer SSL avec Let's Encrypt
5. **Firewall** : Limiter l'accès aux ports nécessaires
