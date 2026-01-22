# 🚀 Installation - Therapy Center API V1

## Ordre d'exécution des commandes

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

### 4. Créer le fichier .env

Copiez `.env.example` vers `.env` (si non existant) et configurez :

```bash
cp .env.example .env
php artisan key:generate
```

### 5. Configurer la base de données dans .env

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=therapy_center
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
```

### 6. Configurer Stripe dans .env

```env
STRIPE_KEY=pk_test_votre_cle_publique
STRIPE_SECRET=sk_test_votre_cle_secrete
```

### 7. Exécuter les migrations

```bash
php artisan migrate
```

### 8. Exécuter les seeders

```bash
php artisan db:seed
```

### 9. Démarrer le serveur

```bash
php artisan serve
```

L'API sera accessible sur : `http://localhost:8000/api`

---

## ✅ Vérification

Testez l'endpoint de santé :

```bash
curl http://localhost:8000/up
```

---

## 📝 Comptes créés par le seeder

- **Admin**: `admin@therapycenter.com` / `password`
- **SuperAdmin**: `superadmin@therapycenter.com` / `password`
- **User**: `user@therapycenter.com` / `password`

---

## 🔧 Configuration supplémentaire

### Mail (pour vérification email)

Dans `.env`, configurez votre service mail :

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=votre_username
MAIL_PASSWORD=votre_password
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@therapycenter.com"
MAIL_FROM_NAME="Therapy Center"
```

### Configuration des rendez-vous

Dans `.env` :

```env
APPOINTMENT_UNIT_PRICE=50.00
APPOINTMENT_DEPOSIT_AMOUNT=20.00
APPOINTMENT_CANCELLATION_HOURS=24
APPOINTMENT_MAX_PEOPLE=5
APPOINTMENT_MIN_PEOPLE=1
```

---

## 🧪 Test rapide

### Test d'inscription

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "phone": "+33123456789",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### Test de connexion

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@therapycenter.com",
    "password": "password"
  }'
```

---

## 📚 Documentation complète

Consultez `API_DOCUMENTATION.md` pour la documentation complète de l'API.
