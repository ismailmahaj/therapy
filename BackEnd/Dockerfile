# Dockerfile Laravel Backend (PHP 8.2 FPM + Nginx + Supervisor)
FROM php:8.2-fpm-alpine

# --- Variables d'environnement PHP / OPcache ---
ENV PHP_OPCACHE_ENABLE=1 \
# --- Installation des dépendances de build (pour extensions PHP) ---
    RUN apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    icu-dev \
    oniguruma-dev \
    libzip-dev \
    pcre-dev

# --- Configuration GD et installation des extensions PHP ---
RUN docker-php-ext-configure gd \
    && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
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
J'ai enlevé les flags --with-freetype et --with-jpeg. Laisse docker-php-ext-configure les détecter automatiquement.

Si ça échoue encore, envoie-moi le message d'erreur complet (pas juste "exit code: 2").

refais moi le fichier complet

# Dockerfile Laravel Backend (PHP 8.2 FPM + Nginx + Supervisor)
FROM php:8.2-fpm-alpine

# --- Variables d'environnement PHP / OPcache ---
ENV PHP_OPCACHE_ENABLE=1 \
    PHP_OPCACHE_MEMORY_CONSUMPTION=128 \
    PHP_OPCACHE_INTERNED_STRINGS_BUFFER=8 \
    PHP_OPCACHE_MAX_ACCELERATED_FILES=4000 \
    PHP_OPCACHE_REVALIDATE_FREQ=2 \
    PHP_OPCACHE_FAST_SHUTDOWN=1

# --- Installation des dépendances runtime ---
RUN apk add --no-cache \
    git \
    curl \
    zip \
    unzip \
    bash \
    shadow \
    supervisor \
    nginx \
    nodejs \
    npm \
    mysql-client \
    libpng \
    libjpeg-turbo \
    freetype \
    libzip \
    oniguruma \
    icu \
    zlib

# --- Installation des dépendances de build (pour extensions PHP) ---
RUN apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    icu-dev \
    oniguruma-dev \
    libzip-dev \
    pcre-dev

# --- Configuration GD et installation des extensions PHP ---
RUN docker-php-ext-configure gd \
    && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
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

# --- Installation de Redis ---
RUN pecl install redis \
    && docker-php-ext-enable redis

# --- Nettoyage des dépendances de build ---
RUN apk del .build-deps \
    && rm -rf /tmp/* /var/cache/apk/*

# --- Installation de Composer ---
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# --- Création utilisateur www ---
RUN addgroup -g 1000 www \
    && adduser -u 1000 -D -G www -s /bin/bash www

# --- Répertoire de travail ---
WORKDIR /var/www/html

# --- Copie des fichiers Laravel ---
COPY --chown=www:www . /var/www/html

# --- Installation des dépendances PHP ---
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# --- Installation Node.js (si package.json présent) ---
RUN if [ -f "package.json" ]; then npm install && npm run build; fi

# --- Configuration PHP-FPM ---
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# --- Configuration Nginx ---
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/default.conf /etc/nginx/http.d/default.conf

# --- Configuration Supervisor ---
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
RUN mkdir -p /var/log/supervisor

# --- Création répertoires storage et bootstrap/cache ---
RUN mkdir -p /var/www/html/storage/framework/{sessions,views,cache} \
    && mkdir -p /var/www/html/storage/logs \
    && mkdir -p /var/www/html/bootstrap/cache \
    && chown -R www:www /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# --- Entrypoint Laravel Docker ---
COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# --- Exposition port ---
EXPOSE 80

# --- Entrypoint et CMD ---
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]