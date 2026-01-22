# 🔧 Solution : Secret is not set (JWT_SECRET)

## Problème
L'erreur "Secret is not set" lors de la connexion indique que la clé JWT n'est pas configurée.

## ✅ Solution

### Option 1 : Générer automatiquement la clé JWT (Recommandé)

```bash
cd BackEnd
php artisan jwt:secret
```

Cette commande va :
1. Générer une clé JWT aléatoire
2. L'ajouter automatiquement dans votre fichier `.env`

### Option 2 : Ajouter manuellement dans `.env`

Si la commande ne fonctionne pas, ajoutez manuellement dans votre fichier `.env` :

```env
JWT_SECRET=votre_cle_secrete_aleatoire_tres_longue
```

Pour générer une clé aléatoire, utilisez :

```bash
php artisan tinker
>>> Str::random(64)
```

Ou en ligne de commande :
```bash
php -r "echo bin2hex(random_bytes(32));"
```

### Option 3 : Utiliser la clé de l'application

Si vous préférez, vous pouvez utiliser la même clé que votre application Laravel :

```env
JWT_SECRET=${APP_KEY}
```

Mais il est recommandé d'avoir une clé séparée pour JWT.

## 📝 Configuration complète du `.env`

Assurez-vous que votre fichier `.env` contient :

```env
APP_NAME="Therapy Center API"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=therapy_center
DB_USERNAME=root
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=votre_cle_jwt_generee
JWT_TTL=60

# Stripe Configuration
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...
```

## ✅ Vérification

Après avoir ajouté `JWT_SECRET`, vérifiez que tout fonctionne :

```bash
php artisan config:clear
php artisan cache:clear
```

Puis testez la connexion à nouveau.

## 🚨 Important

- **Ne partagez JAMAIS votre `JWT_SECRET`** publiquement
- Cette clé doit être unique et sécurisée
- Si vous changez la clé, tous les tokens existants deviendront invalides
- En production, utilisez une clé générée aléatoirement et longue (64+ caractères)
