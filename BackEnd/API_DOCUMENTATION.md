# Therapy Center - API Documentation V1

## 📋 Table des matières

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Authentification](#authentification)
4. [Endpoints API](#endpoints-api)
5. [Exemples de requêtes](#exemples-de-requêtes)

---

## 🚀 Installation

### 1. Installer les dépendances

```bash
cd BackEnd
composer install
```

### 2. Configuration JWT

```bash
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
php artisan jwt:secret
```

### 3. Configuration de l'environnement

Créez un fichier `.env` à partir de `.env.example` et configurez :

```env
APP_NAME="Therapy Center API"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=therapy_center
DB_USERNAME=root
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=
JWT_TTL=60

# Stripe Configuration
STRIPE_KEY=pk_test_...
STRIPE_SECRET=sk_test_...

# Appointment Configuration
APPOINTMENT_UNIT_PRICE=50.00
APPOINTMENT_DEPOSIT_AMOUNT=20.00
APPOINTMENT_CANCELLATION_HOURS=24
APPOINTMENT_MAX_PEOPLE=5
APPOINTMENT_MIN_PEOPLE=1

# Mail Configuration (pour vérification email)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@therapycenter.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### 4. Exécuter les migrations et seeders

```bash
php artisan migrate
php artisan db:seed
```

---

## ⚙️ Configuration

### Base de données

Les tables créées sont :
- `users` - Utilisateurs (clients/patients)
- `appointments` - Rendez-vous Hijama
- `payments` - Paiements (acomptes)
- `donations` - Donations

### Rôles

- `user` - Client/Patient (par défaut)
- `admin` - Administrateur
- `superadmin` - Super administrateur

---

## 🔐 Authentification

L'API utilise JWT (JSON Web Tokens) pour l'authentification.

### Headers requis pour les routes protégées

```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## 📡 Endpoints API

### Base URL
```
http://localhost:8000/api
```

### Routes Publiques

#### 1. Inscription
```
POST /api/register
```

#### 2. Connexion
```
POST /api/login
```

#### 3. Vérification Email
```
POST /api/verify-email
```

### Routes Protégées (nécessitent JWT)

#### Authentification
- `POST /api/logout` - Déconnexion
- `GET /api/me` - Profil utilisateur

#### Rendez-vous
- `GET /api/appointments` - Liste des rendez-vous
- `POST /api/appointments` - Créer un rendez-vous
- `GET /api/appointments/{id}` - Détails d'un rendez-vous
- `POST /api/appointments/{id}/cancel` - Annuler un rendez-vous

#### Paiements
- `POST /api/payments/create-intent` - Créer un PaymentIntent Stripe
- `POST /api/payments/confirm` - Confirmer un paiement

#### Donations
- `GET /api/donations` - Liste des donations
- `POST /api/donations` - Créer une donation
- `GET /api/donations/{id}` - Détails d'une donation

#### Dashboard
- `GET /api/dashboard` - Vue d'ensemble
- `GET /api/dashboard/appointments` - Rendez-vous utilisateur
- `GET /api/dashboard/donations` - Donations utilisateur

### Routes Admin (nécessitent rôle admin/superadmin)

- `GET /api/admin/appointments` - Tous les rendez-vous
- `GET /api/admin/users` - Tous les utilisateurs
- `GET /api/admin/donations` - Toutes les donations

---

## 📝 Exemples de requêtes

### 1. Inscription

**Request:**
```json
POST /api/register
Content-Type: application/json

{
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean.dupont@example.com",
  "phone": "+33123456789",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response (201):**
```json
{
  "message": "Inscription réussie. Veuillez vérifier votre email.",
  "user": {
    "id": 1,
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean.dupont@example.com",
    "phone": "+33123456789",
    "role": "user",
    "email_verified_at": null
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 2. Connexion

**Request:**
```json
POST /api/login
Content-Type: application/json

{
  "email": "jean.dupont@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": 1,
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean.dupont@example.com",
    "role": "user"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 3. Créer un rendez-vous

**Request:**
```json
POST /api/appointments
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "hijama",
  "gender": "homme",
  "appointment_date": "2024-12-25 14:00:00",
  "number_of_people": 2
}
```

**Response (201):**
```json
{
  "message": "Rendez-vous créé avec succès",
  "appointment": {
    "id": 1,
    "user_id": 1,
    "type": "hijama",
    "gender": "homme",
    "appointment_date": "2024-12-25 14:00:00",
    "number_of_people": 2,
    "unit_price": "50.00",
    "total_price": "100.00",
    "deposit_amount": "20.00",
    "status": "pending",
    "created_at": "2024-01-15T10:00:00.000000Z"
  }
}
```

### 4. Créer un PaymentIntent pour l'acompte

**Request:**
```json
POST /api/payments/create-intent
Authorization: Bearer {token}
Content-Type: application/json

{
  "appointment_id": 1
}
```

**Response (200):**
```json
{
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxx"
}
```

### 5. Confirmer un paiement

**Request:**
```json
POST /api/payments/confirm
Authorization: Bearer {token}
Content-Type: application/json

{
  "payment_intent_id": "pi_xxx"
}
```

**Response (200):**
```json
{
  "message": "Paiement confirmé avec succès",
  "payment": {
    "id": 1,
    "appointment_id": 1,
    "amount": "20.00",
    "status": "succeeded",
    "payment_intent_id": "pi_xxx"
  },
  "appointment": {
    "id": 1,
    "status": "confirmed"
  }
}
```

### 6. Créer une donation

**Request:**
```json
POST /api/donations
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "puit",
  "amount": 100.00,
  "sadaqa_name": "Pour mes parents"
}
```

**Response (201):**
```json
{
  "message": "Donation créée avec succès",
  "donation": {
    "id": 1,
    "user_id": 1,
    "type": "puit",
    "amount": "100.00",
    "sadaqa_name": "Pour mes parents",
    "status": "pending",
    "payment_intent_id": "pi_xxx"
  },
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxx"
}
```

### 7. Dashboard

**Request:**
```json
GET /api/dashboard
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean.dupont@example.com"
  },
  "upcoming_appointments": [
    {
      "id": 1,
      "appointment_date": "2024-12-25 14:00:00",
      "status": "confirmed"
    }
  ],
  "total_donations": "150.00"
}
```

### 8. Annuler un rendez-vous

**Request:**
```json
POST /api/appointments/1/cancel
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Rendez-vous annulé avec succès",
  "appointment": {
    "id": 1,
    "status": "cancelled"
  }
}
```

### 9. Admin - Tous les rendez-vous

**Request:**
```json
GET /api/admin/appointments
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "appointments": [
    {
      "id": 1,
      "user": {
        "first_name": "Jean",
        "last_name": "Dupont"
      },
      "appointment_date": "2024-12-25 14:00:00",
      "status": "confirmed",
      "payment": {
        "status": "succeeded"
      }
    }
  ]
}
```

---

## 🔒 Règles de validation

### Rendez-vous
- `type`: doit être "hijama"
- `gender`: doit être "homme" ou "femme"
- `appointment_date`: doit être une date future
- `number_of_people`: entre 1 et 5

### Donations
- `type`: doit être "puit", "arbre" ou "mosquee"
- `amount`: minimum 1.00
- `sadaqa_name`: optionnel, max 255 caractères

---

## ⚠️ Notes importantes

1. **Vérification email obligatoire** : Un utilisateur doit vérifier son email avant de pouvoir se connecter.

2. **Confirmation de rendez-vous** : Un rendez-vous n'est confirmé que si l'acompte est payé avec succès.

3. **Annulation** : Un rendez-vous ne peut être annulé que X heures avant la date (configurable, par défaut 24h).

4. **Paiements** : Utilisez Stripe en mode test pour le développement. Les clés de test commencent par `pk_test_` et `sk_test_`.

5. **JWT Token** : Le token expire après 60 minutes par défaut (configurable dans `.env`).

---

## 🧪 Comptes de test (après seeder)

- **Admin**: `admin@therapycenter.com` / `password`
- **SuperAdmin**: `superadmin@therapycenter.com` / `password`
- **User**: `user@therapycenter.com` / `password`

---

## 📦 Structure des fichiers

```
BackEnd/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php
│   │   │       ├── AppointmentController.php
│   │   │       ├── PaymentController.php
│   │   │       ├── DonationController.php
│   │   │       ├── DashboardController.php
│   │   │       └── AdminController.php
│   │   ├── Middleware/
│   │   │   └── RoleMiddleware.php
│   │   └── Requests/
│   │       ├── Auth/
│   │       ├── Appointment/
│   │       ├── Payment/
│   │       └── Donation/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Appointment.php
│   │   ├── Payment.php
│   │   └── Donation.php
│   └── Policies/
│       ├── AppointmentPolicy.php
│       └── DonationPolicy.php
├── database/
│   ├── migrations/
│   └── seeders/
├── routes/
│   └── api.php
└── config/
    ├── appointment.php
    └── services.php
```

---

## 🚀 Prochaines étapes (V2-V5)

Cette API V1 est conçue pour être extensible. Les futures versions pourront inclure :
- Gestion avancée des rendez-vous (récurrence, notifications)
- Système de remboursement
- Donations récurrentes
- Dashboard admin avancé
- Statistiques et rapports
- Notifications push
- Multi-langue

---

**Développé avec ❤️ pour Therapy Center**
