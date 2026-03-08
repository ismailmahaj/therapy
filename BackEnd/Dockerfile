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
    netcat-openbsd \
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
    linux-headers \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    icu-dev \
    oniguruma-dev \
    libzip-dev \
    pcre-dev

# --- Installation des extensions PHP ---
RUN docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    mysqli \
    zip \
    mbstring \
    exif \
    pcntl \
    bcmath \
    opcache \
    intl \
    sockets

# --- Installation de GD (avec support freetype et jpeg) ---
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd

# --- Installation de Redis ---
RUN pecl install redis \
    && docker-php-ext-enable redis

# --- Nettoyage des dépendances de build ---
RUN apk del .build-deps \
    && rm -rf /tmp/* /var/cache/apk/*

# --- Installation de Composer ---
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# --- Configuration PHP (avant installation Composer pour augmenter mémoire) ---
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini

# --- Création utilisateur www ---
RUN addgroup -g 1000 www \
    && adduser -u 1000 -D -G www -s /bin/bash www

# --- Répertoire de travail ---
WORKDIR /var/www/html

# --- Copie des fichiers Composer en premier (pour optimiser le cache Docker) ---
COPY --chown=www:www composer.json composer.lock* ./

# --- Installation des dépendances PHP (avec gestion d'erreurs améliorée) ---
RUN echo "📦 Vérification des fichiers Composer..." && \
    ls -la composer.json && \
    if [ -f composer.lock ]; then \
        echo "✅ composer.lock trouvé, utilisation de composer install"; \
        INSTALL_CMD="install"; \
    else \
        echo "⚠️ composer.lock non trouvé, utilisation de composer update"; \
        INSTALL_CMD="update"; \
    fi && \
    echo "🧹 Nettoyage du cache Composer..." && \
    php -d memory_limit=512M /usr/bin/composer clear-cache || true && \
    echo "📥 Installation des dépendances Composer (tentative 1)..." && \
    (php -d memory_limit=512M /usr/bin/composer $INSTALL_CMD \
        --no-dev \
        --optimize-autoloader \
        --no-interaction \
        --prefer-dist \
        --no-scripts \
        --ignore-platform-reqs \
        --no-progress \
        --ansi || \
    (echo "⚠️ Première tentative échouée, nettoyage et nouvelle tentative..." && \
     php -d memory_limit=512M /usr/bin/composer clear-cache && \
     sleep 5 && \
     echo "📥 Installation des dépendances Composer (tentative 2)..." && \
     php -d memory_limit=512M /usr/bin/composer $INSTALL_CMD \
         --no-dev \
         --optimize-autoloader \
         --no-interaction \
         --prefer-dist \
         --no-scripts \
         --ignore-platform-reqs \
         --no-progress \
         --ansi)) && \
    echo "🔄 Optimisation de l'autoloader..." && \
    php -d memory_limit=512M /usr/bin/composer dump-autoload --optimize --classmap-authoritative && \
    echo "✅ Installation Composer terminée avec succès!"

# --- Copie du reste des fichiers Laravel ---
COPY --chown=www:www . /var/www/html

# --- Configuration PHP-FPM (après copie complète) ---
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# --- Exécution des scripts Composer (après copie complète) ---
RUN php -d memory_limit=512M /usr/bin/composer run-script post-autoload-dump || true

# --- Installation Node.js (si package.json présent) ---
RUN if [ -f "package.json" ]; then npm install && npm run build; fi

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

# --- Exposition port (Railway utilise $PORT dynamiquement) ---
EXPOSE 80
ENV PORT=80

# --- Entrypoint et CMD ---
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]