-- Script d'initialisation MySQL pour Laravel
-- Ce script s'exécute automatiquement lors du premier démarrage du conteneur MySQL

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS laravel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Accorder les privilèges (si nécessaire)
-- GRANT ALL PRIVILEGES ON laravel.* TO 'root'@'%';
-- FLUSH PRIVILEGES;
