#!/bin/bash
set -e

# Aller dans le répertoire de travail
cd /var/www/html || exit 1

echo "🚀 Démarrage du conteneur Laravel..."

# Attendre que la base de données soit prête (si nécessaire)
if [ -n "$DB_HOST" ] && [ "$DB_HOST" != "127.0.0.1" ] && [ "$DB_HOST" != "localhost" ]; then
    echo "⏳ Attente de la base de données..."
    until nc -z "$DB_HOST" "${DB_PORT:-3306}" 2>/dev/null; do
        echo "⏳ En attente de la base de données..."
        sleep 2
    done
    echo "✅ Base de données prête!"
fi

# Vérifier si .env existe, sinon copier depuis .env.example
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        echo "⚠️  .env.example non trouvé, création d'un .env basique..."
        cat > .env <<EOF
APP_NAME=Laravel
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
EOF
    fi
fi

# Générer la clé d'application si elle n'existe pas
if ! grep -q "APP_KEY=base64:" .env 2>/dev/null; then
    echo "🔑 Génération de la clé d'application..."
    php artisan key:generate --force
fi

# Optimiser Laravel pour la production
echo "⚡ Optimisation de Laravel..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Exécuter les migrations (optionnel, peut être désactivé)
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    echo "🗄️  Exécution des migrations..."
    php artisan migrate --force || echo "⚠️  Erreur lors des migrations (peut être normal si déjà exécutées)"
fi

# Créer les liens symboliques pour le stockage
echo "🔗 Création des liens symboliques..."
php artisan storage:link || echo "⚠️  Le lien de stockage existe déjà"

# Ajuster les permissions
echo "🔐 Ajustement des permissions..."
chown -R www:www /var/www/html/storage 2>/dev/null || true
chown -R www:www /var/www/html/bootstrap/cache 2>/dev/null || true
chmod -R 775 /var/www/html/storage 2>/dev/null || true
chmod -R 775 /var/www/html/bootstrap/cache 2>/dev/null || true

# Créer les répertoires de logs pour Supervisor
mkdir -p /var/log/supervisor
chmod 755 /var/log/supervisor

echo "✅ Configuration terminée!"

# Exécuter la commande passée en argument (généralement Supervisor qui doit être root)
exec "$@"
