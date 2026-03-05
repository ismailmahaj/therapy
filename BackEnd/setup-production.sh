#!/bin/bash

# Script de configuration Laravel pour la production
# Usage: sudo bash setup-production.sh

echo "🚀 Configuration Laravel pour la production..."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "artisan" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis le répertoire BackEnd${NC}"
    exit 1
fi

# 1. Permissions
echo -e "${YELLOW}📁 Configuration des permissions...${NC}"
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
sudo chmod -R 775 storage
sudo chmod -R 775 bootstrap/cache
echo -e "${GREEN}✅ Permissions configurées${NC}"

# 2. Fichier .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Création du fichier .env...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Fichier .env créé${NC}"
    echo -e "${YELLOW}⚠️  N'oubliez pas de configurer votre .env !${NC}"
else
    echo -e "${GREEN}✅ Fichier .env existe déjà${NC}"
fi

# 3. Clé d'application
echo -e "${YELLOW}🔑 Génération de la clé d'application...${NC}"
php artisan key:generate --force
echo -e "${GREEN}✅ Clé générée${NC}"

# 4. Dépendances Composer
echo -e "${YELLOW}📦 Installation des dépendances...${NC}"
if [ -f "composer.json" ]; then
    composer install --optimize-autoloader --no-dev --no-interaction
    echo -e "${GREEN}✅ Dépendances installées${NC}"
else
    echo -e "${RED}❌ composer.json non trouvé${NC}"
fi

# 5. Migrations
echo -e "${YELLOW}🗄️  Exécution des migrations...${NC}"
read -p "Exécuter les migrations ? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    php artisan migrate --force
    echo -e "${GREEN}✅ Migrations exécutées${NC}"
else
    echo -e "${YELLOW}⏭️  Migrations ignorées${NC}"
fi

# 6. Optimisation
echo -e "${YELLOW}⚡ Optimisation de Laravel...${NC}"
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo -e "${GREEN}✅ Optimisation terminée${NC}"

# 7. Résumé
echo -e "\n${GREEN}✅ Configuration terminée !${NC}"
echo -e "\n${YELLOW}📋 Prochaines étapes :${NC}"
echo "1. Configurez votre fichier .env"
echo "2. Configurez Apache (voir APACHE_CONFIG.md)"
echo "3. Testez l'API : curl http://votre-domaine.com/api"
