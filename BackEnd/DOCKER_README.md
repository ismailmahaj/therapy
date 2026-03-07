# 🐳 Guide Docker pour le Backend Laravel

Ce guide explique comment utiliser Docker pour déployer et développer le backend Laravel.

## 📋 Prérequis

- Docker (version 20.10+)
- Docker Compose (version 2.0+)

## 🚀 Démarrage rapide

### 1. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet BackEnd avec les variables suivantes :

```env
APP_NAME=Hijama
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=root

REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_TTL=60

# Stripe
STRIPE_KEY=your-stripe-key
STRIPE_SECRET=your-stripe-secret

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
```

### 2. Construction et démarrage

```bash
# Construire les images
docker-compose build

# Démarrer les conteneurs
docker-compose up -d

# Voir les logs
docker-compose logs -f app
```

### 3. Configuration initiale

```bash
# Entrer dans le conteneur
docker-compose exec app bash

# Générer la clé d'application (si nécessaire)
php artisan key:generate

# Exécuter les migrations
php artisan migrate --force

# Exécuter les seeders (optionnel)
php artisan db:seed

# Créer le lien de stockage
php artisan storage:link
```

## 🔧 Commandes utiles

### Gestion des conteneurs

```bash
# Démarrer les conteneurs
docker-compose up -d

# Arrêter les conteneurs
docker-compose down

# Redémarrer les conteneurs
docker-compose restart

# Voir les logs
docker-compose logs -f [service_name]

# Reconstruire les images
docker-compose build --no-cache
```

### Commandes Laravel dans le conteneur

```bash
# Entrer dans le conteneur
docker-compose exec app bash

# Exécuter une commande Artisan
docker-compose exec app php artisan [command]

# Exécuter les migrations
docker-compose exec app php artisan migrate

# Exécuter les seeders
docker-compose exec app php artisan db:seed

# Nettoyer le cache
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear
docker-compose exec app php artisan view:clear
```

### Accès à la base de données

```bash
# Accéder à MySQL
docker-compose exec db mysql -u root -p

# Accéder à Redis
docker-compose exec redis redis-cli
```

## 🌐 Accès aux services

Une fois les conteneurs démarrés, vous pouvez accéder à :

- **Application Laravel** : http://localhost:8000
- **phpMyAdmin** (si activé) : http://localhost:8080
- **MySQL** : localhost:3306
- **Redis** : localhost:6379

## 📁 Structure des fichiers Docker

```
BackEnd/
├── Dockerfile                 # Image principale de l'application
├── docker-compose.yml         # Configuration des services
├── .dockerignore              # Fichiers à ignorer lors du build
└── docker/
    ├── docker-entrypoint.sh   # Script d'initialisation
    ├── nginx.conf             # Configuration Nginx
    ├── default.conf           # Configuration du serveur virtuel
    ├── php.ini                # Configuration PHP
    ├── php-fpm.conf           # Configuration PHP-FPM
    ├── opcache.ini             # Configuration OPcache
    ├── supervisord.conf       # Configuration Supervisor
    └── mysql/
        └── init.sql           # Script d'initialisation MySQL
```

## 🔒 Sécurité

### Variables d'environnement sensibles

Ne commitez **jamais** le fichier `.env` dans Git. Utilisez `.env.example` comme modèle.

### Permissions

Les permissions sont automatiquement configurées dans le Dockerfile pour :
- `/var/www/html/storage` : 775
- `/var/www/html/bootstrap/cache` : 775

### Utilisateur non-root

Le conteneur s'exécute avec l'utilisateur `www` (UID 1000) pour plus de sécurité.

## 🚀 Déploiement en production

### Variables d'environnement importantes

```env
APP_ENV=production
APP_DEBUG=false
RUN_MIGRATIONS=true
```

### Optimisations

Le Dockerfile inclut automatiquement :
- ✅ OPcache activé et optimisé
- ✅ Cache de configuration Laravel
- ✅ Cache des routes
- ✅ Cache des vues
- ✅ Compression Gzip activée

### Build pour la production

```bash
# Build optimisé
docker build -t hijama-backend:latest .

# Tag pour le registre
docker tag hijama-backend:latest your-registry/hijama-backend:latest

# Push vers le registre
docker push your-registry/hijama-backend:latest
```

## 🐛 Dépannage

### Les migrations ne s'exécutent pas

```bash
# Vérifier la connexion à la base de données
docker-compose exec app php artisan migrate:status

# Exécuter manuellement
docker-compose exec app php artisan migrate --force
```

### Erreurs de permissions

```bash
# Réparer les permissions
docker-compose exec app chown -R www:www /var/www/html/storage
docker-compose exec app chmod -R 775 /var/www/html/storage
```

### Le cache ne se vide pas

```bash
# Nettoyer tous les caches
docker-compose exec app php artisan optimize:clear
```

### Redémarrer complètement

```bash
# Arrêter et supprimer les conteneurs et volumes
docker-compose down -v

# Reconstruire et redémarrer
docker-compose up -d --build
```

## 📝 Notes importantes

1. **Base de données** : Les données MySQL sont persistées dans un volume Docker nommé `mysql_data`.

2. **Redis** : Les données Redis sont persistées dans un volume Docker nommé `redis_data`.

3. **Storage** : Le répertoire `storage` est monté comme volume pour persister les fichiers uploadés.

4. **Logs** : Les logs sont accessibles via `docker-compose logs -f app`.

5. **Health Check** : Un endpoint `/health` est disponible pour vérifier l'état de l'application.

## 🔄 Mise à jour

Pour mettre à jour l'application :

```bash
# Récupérer les dernières modifications
git pull

# Reconstruire l'image
docker-compose build --no-cache

# Redémarrer les conteneurs
docker-compose up -d

# Exécuter les migrations (si nécessaire)
docker-compose exec app php artisan migrate --force
```

## 📚 Ressources

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Documentation Laravel](https://laravel.com/docs)
