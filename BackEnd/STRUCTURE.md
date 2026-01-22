# 📁 Structure du Projet - Therapy Center API V1

## Structure complète des fichiers créés

```
BackEnd/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Controller.php (existant)
│   │   │   └── Api/
│   │   │       ├── AuthController.php ✨
│   │   │       ├── AppointmentController.php ✨
│   │   │       ├── PaymentController.php ✨
│   │   │       ├── DonationController.php ✨
│   │   │       ├── DashboardController.php ✨
│   │   │       └── AdminController.php ✨
│   │   ├── Middleware/
│   │   │   └── RoleMiddleware.php ✨
│   │   └── Requests/
│   │       ├── Auth/
│   │       │   ├── RegisterRequest.php ✨
│   │       │   └── LoginRequest.php ✨
│   │       ├── Appointment/
│   │       │   └── StoreAppointmentRequest.php ✨
│   │       ├── Payment/
│   │       │   ├── CreatePaymentIntentRequest.php ✨
│   │       │   └── ConfirmPaymentRequest.php ✨
│   │       └── Donation/
│   │           └── StoreDonationRequest.php ✨
│   ├── Models/
│   │   ├── User.php (modifié) ✨
│   │   ├── Appointment.php ✨
│   │   ├── Payment.php ✨
│   │   └── Donation.php ✨
│   ├── Policies/
│   │   ├── AppointmentPolicy.php ✨
│   │   └── DonationPolicy.php ✨
│   └── Providers/
│       ├── AppServiceProvider.php (existant)
│       └── AuthServiceProvider.php ✨
├── bootstrap/
│   └── app.php (modifié) ✨
│   └── providers.php (modifié) ✨
├── config/
│   ├── auth.php (modifié) ✨
│   ├── services.php (modifié) ✨
│   └── appointment.php ✨
├── database/
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php (modifié) ✨
│   │   ├── 2024_01_01_000001_create_appointments_table.php ✨
│   │   ├── 2024_01_01_000002_create_payments_table.php ✨
│   │   └── 2024_01_01_000003_create_donations_table.php ✨
│   └── seeders/
│       └── DatabaseSeeder.php (modifié) ✨
├── routes/
│   ├── web.php (existant)
│   └── api.php ✨
├── composer.json (modifié) ✨
├── API_DOCUMENTATION.md ✨
├── INSTALLATION.md ✨
└── STRUCTURE.md (ce fichier) ✨
```

✨ = Fichier créé ou modifié pour cette API

---

## 📊 Base de données

### Tables créées

1. **users**
   - id, first_name, last_name, email, phone
   - password, role (enum: user, admin, superadmin)
   - email_verified_at, timestamps

2. **appointments**
   - id, user_id (FK)
   - type (enum: hijama), gender (enum: homme, femme)
   - appointment_date, number_of_people
   - unit_price, total_price, deposit_amount
   - status (enum: pending, confirmed, cancelled)
   - timestamps

3. **payments**
   - id, appointment_id (FK), user_id (FK)
   - payment_intent_id (unique)
   - amount, status (enum: pending, succeeded, failed, cancelled)
   - payment_method, stripe_response (JSON)
   - timestamps

4. **donations**
   - id, user_id (FK)
   - type (enum: puit, arbre, mosquee)
   - amount, sadaqa_name
   - payment_intent_id (unique, nullable)
   - status (enum: pending, succeeded, failed)
   - stripe_response (JSON)
   - timestamps

---

## 🔗 Relations Eloquent

### User
- `hasMany(Appointment::class)`
- `hasMany(Payment::class)`
- `hasMany(Donation::class)`

### Appointment
- `belongsTo(User::class)`
- `hasOne(Payment::class)`

### Payment
- `belongsTo(Appointment::class)`
- `belongsTo(User::class)`

### Donation
- `belongsTo(User::class)`

---

## 🛣️ Routes API

### Publiques
- `POST /api/register`
- `POST /api/login`
- `POST /api/verify-email`

### Protégées (auth:api)
- `POST /api/logout`
- `GET /api/me`
- `GET /api/appointments`
- `POST /api/appointments`
- `GET /api/appointments/{id}`
- `POST /api/appointments/{id}/cancel`
- `POST /api/payments/create-intent`
- `POST /api/payments/confirm`
- `GET /api/donations`
- `POST /api/donations`
- `GET /api/donations/{id}`
- `GET /api/dashboard`
- `GET /api/dashboard/appointments`
- `GET /api/dashboard/donations`

### Admin (role:admin,superadmin)
- `GET /api/admin/appointments`
- `GET /api/admin/users`
- `GET /api/admin/donations`

---

## 🔐 Sécurité

### Middleware
- `auth:api` - Vérification JWT
- `role:admin,superadmin` - Vérification des rôles

### Policies
- `AppointmentPolicy` - Contrôle d'accès aux rendez-vous
- `DonationPolicy` - Contrôle d'accès aux donations

---

## ⚙️ Configuration

### Fichiers de configuration
- `config/appointment.php` - Configuration des rendez-vous
- `config/services.php` - Configuration Stripe
- `config/auth.php` - Configuration JWT guard

### Variables d'environnement (.env)
```env
# JWT
JWT_SECRET=
JWT_TTL=60

# Stripe
STRIPE_KEY=
STRIPE_SECRET=

# Appointments
APPOINTMENT_UNIT_PRICE=50.00
APPOINTMENT_DEPOSIT_AMOUNT=20.00
APPOINTMENT_CANCELLATION_HOURS=24
APPOINTMENT_MAX_PEOPLE=5
APPOINTMENT_MIN_PEOPLE=1
```

---

## 📦 Dépendances ajoutées

### Composer
- `tymon/jwt-auth: ^2.2` - Authentification JWT
- `stripe/stripe-php: ^14.0` - SDK Stripe

---

## ✅ Checklist de déploiement

- [ ] Installer les dépendances (`composer install`)
- [ ] Publier la config JWT (`php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"`)
- [ ] Générer la clé JWT (`php artisan jwt:secret`)
- [ ] Configurer `.env` (DB, Stripe, Mail)
- [ ] Exécuter les migrations (`php artisan migrate`)
- [ ] Exécuter les seeders (`php artisan db:seed`)
- [ ] Tester l'API avec les exemples de `API_DOCUMENTATION.md`

---

## 🎯 Fonctionnalités V1

✅ Authentification JWT avec vérification email  
✅ Gestion des rendez-vous Hijama  
✅ Calcul automatique des prix  
✅ Paiement d'acompte via Stripe  
✅ Donations (puit, arbre, mosquée)  
✅ Dashboard utilisateur  
✅ Interface admin basique  
✅ Validation complète  
✅ Policies de sécurité  
✅ Seeders avec données de test  

---

**Prêt pour la production V1 ! 🚀**
