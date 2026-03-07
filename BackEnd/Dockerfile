# Dockerfile optimisé pour Laravel Backend
FROM php:8.2-fpm-alpine AS base

# Variables d'environnement pour OPcache
ENV PHP_OPCACHE_ENABLE=1 \
    PHP_OPCACHE_MEMORY_CONSUMPTION=128 \
    PHP_OPCACHE_INTERNED_STRINGS_BUFFER=8 \
    PHP_OPCACHE_MAX_ACCELERATED_FILES=4000 \
    PHP_OPCACHE_REVALIDATE_FREQ=2 \
    PHP_OPCACHE_FAST_SHUTDOWN=1

# Installation des dépendances système et build
RUN apk add --no-cache \
        git curl bash shadow supervisor nginx netcat-openbsd nodejs npm \
        libpng libjpeg-turbo freetype libzip oniguruma icu \
    && apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev oniguruma-dev icu-dev pcre-dev \
    \
    # Installation des extensions PHP
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo pdo_mysql mysqli gd zip mbstring exif pcntl bcmath opcache intl sockets \
    \
    # Installation Redis
    && pecl install redis \
    && docker-php-ext-enable redis \
    \
    # Nettoyage des dépendances de build pour réduire la taille de l'image
    && apk del .build-deps \
    && rm -rf /tmp/* /var/cache/apk/*

# Installation de Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Création de l'utilisateur www
RUN addgroup -g 1000 www \
    && adduser -u 1000 -D -G www -s /bin/bash www

# Répertoire de travail
WORKDIR /var/www/html

# Copie des fichiers Laravel et définition des permissions
COPY --chown=www:www . /var/www/html
RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache \
    && chown -R www:www storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Installation des dépendances PHP et Node.js (si package.json existe)
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist \
    && if [ -f "package.json" ]; then npm install && npm run build; fi

# Configuration PHP et OPcache
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Configuration Nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/http.d/default.conf

# Configuration Supervisor
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN mkdir -p /var/log/supervisor

# Script d'entrée
COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Exposition du port
EXPOSE 80

# Entrypoint et CMD
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]