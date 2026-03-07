# 🚀 Démarrage Rapide Docker

## Commandes essentielles

```bash
# 1. Construire l'image
docker-compose build

# 2. Démarrer les services
docker-compose up -d

# 3. Voir les logs
docker-compose logs -f app

# 4. Exécuter les migrations
docker-compose exec app php artisan migrate --force

# 5. Créer un utilisateur admin (si nécessaire)
docker-compose exec app php artisan db:seed
```

## Accès

- **API Laravel** : http://localhost:8000
- **phpMyAdmin** : http://localhost:8080 (si activé avec `docker-compose --profile dev up`)

## Commandes utiles

```bash
# Entrer dans le conteneur
docker-compose exec app bash

# Nettoyer le cache
docker-compose exec app php artisan optimize:clear

# Arrêter les services
docker-compose down

# Redémarrer
docker-compose restart
```

## Variables d'environnement importantes

Créez un fichier `.env` avec au minimum :

```env
APP_NAME=Hijama
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=db
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=root

JWT_SECRET=your-secret-key
```

Pour plus de détails, consultez `DOCKER_README.md`.
