#!/bin/bash

# Script de configuration initiale pour Railway
# À exécuter une seule fois après le premier déploiement

echo "🚀 Configuration Railway pour Laravel..."

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "artisan" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis le répertoire BackEnd${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Étapes de configuration :${NC}"
echo ""
echo "1. Générer APP_KEY (si pas déjà fait)"
php artisan key:generate --force

echo ""
echo "2. Générer JWT_SECRET (si pas déjà fait)"
php artisan jwt:secret --force

echo ""
echo "3. Exécuter les migrations"
read -p "Exécuter les migrations ? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    php artisan migrate --force
    echo -e "${GREEN}✅ Migrations exécutées${NC}"
else
    echo -e "${YELLOW}⏭️  Migrations ignorées${NC}"
fi

echo ""
echo "4. Exécuter les seeders (optionnel)"
read -p "Exécuter les seeders ? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    php artisan db:seed --force
    echo -e "${GREEN}✅ Seeders exécutés${NC}"
else
    echo -e "${YELLOW}⏭️  Seeders ignorés${NC}"
fi

echo ""
echo "5. Créer le lien symbolique storage"
php artisan storage:link

echo ""
echo "6. Optimiser Laravel"
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo ""
echo -e "${GREEN}✅ Configuration terminée !${NC}"
echo ""
echo -e "${YELLOW}📝 Prochaines étapes :${NC}"
echo "1. Vérifiez les variables d'environnement dans Railway"
echo "2. Testez l'API : curl https://votre-app.railway.app/api"
echo "3. Mettez à jour le frontend avec la nouvelle URL API"
