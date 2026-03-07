# Dockerfile pour Laravel Backend
# Utilise PHP 8.2 avec toutes les extensions nécessaires

FROM php:8.2-fpm-alpine AS base

# Variables d'environnement
ENV PHP_OPCACHE_ENABLE=1
ENV PHP_OPCACHE_MEMORY_CONSUMPTION=128
ENV PHP_OPCACHE_INTERNED_STRINGS_BUFFER=8
ENV PHP_OPCACHE_MAX_ACCELERATED_FILES=4000
ENV PHP_OPCACHE_REVALIDATE_FREQ=2
ENV PHP_OPCACHE_FAST_SHUTDOWN=1

# Installation des dépendances système (runtime + build)
RUN apk add --no-cache \
    git \
    curl \
    zip \
    unzip \
    mysql-client \
    nodejs \
    npm \
    bash \
    shadow \
    supervisor \
    nginx \
    netcat-openbsd \
    libpng \
    libjpeg-turbo \
    freetype \
    libzip \
    oniguruma \
    icu \
    postgresql-libs

# Installation des dépendances de build (seront supprimées après)
RUN apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    oniguruma-dev \
    icu-dev \
    postgresql-dev \
    pcre-dev

# Installation des extensions PHP nécessaires pour Laravel
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    mysqli \
    gd \
    zip \
    mbstring \
    exif \
    pcntl \
    bcmath \
    opcache \
    intl \
    sockets

# Installation de Redis extension
RUN pecl install redis \
    && docker-php-ext-enable redis

# Nettoyage : suppression des dépendances de build pour réduire la taille de l'image
RUN apk del .build-deps \
    && rm -rf /tmp/* /var/cache/apk/*

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configuration de l'utilisateur et des permissions
RUN groupadd -g 1000 www && \
    useradd -u 1000 -ms /bin/bash -g www www

# Configuration du répertoire de travail
WORKDIR /var/www/html

# Copie des fichiers de configuration
COPY --chown=www:www . /var/www/html

# Installation des dépendances PHP
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Installation des dépendances Node.js (si nécessaire)
RUN if [ -f "package.json" ]; then npm install && npm run build; fi

# Configuration PHP-FPM
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini

# Configuration OPcache
COPY docker/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Configuration Nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/http.d/default.conf

# Configuration Supervisor pour gérer les processus
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Création des répertoires nécessaires avec les bonnes permissions
RUN mkdir -p /var/www/html/storage/framework/{sessions,views,cache} \
    && mkdir -p /var/www/html/storage/logs \
    && mkdir -p /var/www/html/bootstrap/cache \
    && chown -R www:www /var/www/html/storage \
    && chown -R www:www /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage \
    && chmod -R 775 /var/www/html/bootstrap/cache

# Script d'entrée (copié avant le changement d'utilisateur)
COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Création des répertoires de logs pour Supervisor
RUN mkdir -p /var/log/supervisor

# Exposer le port 80
EXPOSE 80

# Point d'entrée (s'exécute en root pour les configurations, puis lance Supervisor)
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Commande par défaut (Supervisor doit s'exécuter en root)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
