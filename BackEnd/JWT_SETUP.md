# Configuration JWT - Therapy Center

## Problème
L'erreur `Interface "Tymon\JWTAuth\Contracts\JWTSubject" not found` indique que le package JWT n'est pas installé ou que l'autoload n'est pas à jour.

## Solution

### 1. Installer les dépendances Composer

```bash
cd BackEnd
composer install
```

### 2. Publier la configuration JWT

```bash
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
```

### 3. Générer la clé JWT

```bash
php artisan jwt:secret
```

Cette commande ajoutera `JWT_SECRET` dans votre fichier `.env`.

### 4. Vérifier la configuration

Assurez-vous que votre fichier `config/auth.php` contient bien le guard `api` avec `jwt` :

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
    'api' => [
        'driver' => 'jwt',
        'provider' => 'users',
    ],
],
```

### 5. Régénérer l'autoload si nécessaire

```bash
composer dump-autoload
```

### 6. Vérifier que le service provider est enregistré

Le package JWT devrait s'enregistrer automatiquement via l'auto-discovery de Laravel. Si ce n'est pas le cas, vérifiez `bootstrap/providers.php` :

```php
return [
    App\Providers\AppServiceProvider::class,
    App\Providers\AuthServiceProvider::class,
];
```

## Si l'erreur persiste

### Vérifier l'installation

```bash
composer show tymon/jwt-auth
```

### Réinstaller le package

```bash
composer remove tymon/jwt-auth
composer require tymon/jwt-auth
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
php artisan jwt:secret
```

## Configuration finale

Après installation, votre `.env` devrait contenir :

```env
JWT_SECRET=votre_secret_jwt_généré
JWT_TTL=60
```

Et votre `config/jwt.php` devrait exister avec toutes les configurations JWT.
