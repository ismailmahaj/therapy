# 📋 Structure Complète V2 - Therapy Center

## ✅ ÉTAT ACTUEL

### Migrations créées ✅
1. `2024_01_01_000005_create_roles_table.php` - Roles + role_user pivot
2. `2024_01_01_000006_create_therapy_slots_table.php` - Créneaux therapy (avec end_time, duration, location, price)
3. `2024_01_01_000007_create_donation_projects_table.php` - Projets donations (complet)
4. `2024_01_01_000009_create_donation_contributions_table.php` - Contributions
5. `2024_01_02_000001_update_users_table_v2.php` - MAJ users (avatar, bio, specialization, soft_deletes)
6. `2024_01_02_000002_create_appointments_v2_table.php` - Appointments V2 (structure complète)
7. `2024_01_02_000003_create_calendar_settings_table.php` - Settings calendrier
8. `2024_01_02_000004_create_recurring_availabilities_table.php` - Disponibilités récurrentes
9. `2024_01_02_000005_create_calendar_exceptions_table.php` - Exceptions calendrier

### Modèles créés ✅
1. `Role.php` - Modèle Role
2. `TherapySlot.php` - Modèle TherapySlot (avec scopes et méthodes)
3. `Appointment.php` - Modèle Appointment V2
4. `DonationProject.php` - Modèle DonationProject
5. `DonationContribution.php` - Modèle DonationContribution
6. `CalendarSetting.php` - Modèle CalendarSetting
7. `RecurringAvailability.php` - Modèle RecurringAvailability
8. `CalendarException.php` - Modèle CalendarException
9. `User.php` - Modifié avec toutes les relations

---

## ⚠️ IMPORTANT : Structure des Tables

### Table `therapy_slots` (Créée)
```sql
- id
- therapy_user_id (FK → users)
- date (date)
- start_time (time)
- end_time (time)
- duration_minutes (integer)
- max_clients (integer, default 1)
- booked_count (integer, default 0)
- statut (enum: available, full, cancelled)
- location (string, nullable)
- price (decimal, nullable)
- notes (text, nullable)
- timestamps
- soft_deletes
```

### Table `appointments` (Recréée - structure V2)
```sql
- id
- slot_id (FK → therapy_slots)
- therapy_user_id (FK → users)
- client_user_id (FK → users)
- statut (enum: pending, confirmed, cancelled, completed)
- payment_status (enum: pending, paid, refunded)
- montant_acompte (decimal)
- payment_intent_id (string, nullable, unique)
- payment_method (string, nullable)
- client_notes (text, nullable)
- therapist_notes (text, nullable)
- confirmed_at, cancelled_at, completed_at (timestamps)
- cancellation_reason (text, nullable)
- timestamps
- soft_deletes
UNIQUE: (slot_id, client_user_id)
```

### Table `donation_projects` (Créée)
```sql
- id
- donation_user_id (FK → users)
- type (enum: puit, arbre, mosquee, ecole, orphelinat, eau, nourriture, autre)
- pays (string)
- nom (string)
- description (text)
- image (string, nullable)
- montant_requis (decimal)
- montant_collecte (decimal, default 0)
- progress_percentage (decimal, default 0)
- statut (enum: draft, active, completed, cancelled)
- is_featured (boolean)
- start_date, end_date (date, nullable)
- beneficiaries_count (integer, nullable)
- timestamps
- soft_deletes
```

### Table `donation_contributions` (Créée)
```sql
- id
- project_id (FK → donation_projects)
- client_user_id (FK → users)
- montant (decimal)
- nom_sadaqa (string, nullable)
- payment_intent_id (string, nullable, unique)
- payment_method (string, nullable)
- statut (enum: pending, succeeded, failed)
- stripe_response (json, nullable)
- timestamps
- soft_deletes
```

### Table `calendar_settings` (Créée)
```sql
- id
- user_id (FK → users, unique)
- timezone (string, default UTC)
- slot_duration_default (integer, default 60)
- max_clients_default (integer, default 1)
- price_default (decimal, nullable)
- booking_advance_days (integer, default 90)
- min_booking_notice_hours (integer, default 24)
- max_bookings_per_day (integer, nullable)
- auto_accept_bookings (boolean)
- buffer_time_minutes (integer, default 0)
- location_default (string, nullable)
- timestamps
```

### Table `recurring_availabilities` (Créée)
```sql
- id
- user_id (FK → users)
- day_of_week (integer: 1-7)
- start_time (time)
- end_time (time)
- slot_duration_minutes (integer)
- max_clients_per_slot (integer, default 1)
- price_per_slot (decimal, nullable)
- is_active (boolean, default true)
- valid_from, valid_until (date, nullable)
- timestamps
```

### Table `calendar_exceptions` (Créée)
```sql
- id
- user_id (FK → users)
- exception_type (enum: unavailable, special_hours, holiday)
- start_date (date)
- end_date (date, nullable)
- start_time, end_time (time, nullable)
- reason (string, nullable)
- is_recurring_yearly (boolean)
- timestamps
```

---

## 📝 FICHIERS À CRÉER (Restants)

Les fichiers suivants doivent être créés pour compléter le système :

### 1. Controllers (à créer)
- `TherapySlotController.php`
- `TherapyAppointmentController.php`
- `CalendarController.php`
- `DonationProjectController.php`
- `ClientAppointmentController.php`
- `ClientDonationController.php`

### 2. Routes (à créer)
- Routes `/api/therapy/*`
- Routes `/api/calendar/*`
- Routes `/api/donation/*`
- Routes `/api/client/*`

### 3. Middleware (à créer)
- `HasRoleMiddleware.php`

### 4. Policies (à créer)
- `TherapySlotPolicy.php`
- `AppointmentPolicy.php`
- `DonationProjectPolicy.php`

### 5. FormRequests (à créer)
- FormRequests pour chaque action

### 6. Seeders (à créer)
- `RoleSeeder.php`
- `DatabaseSeeder.php` (mis à jour)

### 7. Commands (à créer)
- `GenerateSlotsCommand.php`
- `CleanPastSlotsCommand.php`

---

## 🚀 ORDRE D'EXÉCUTION

1. **Exécuter les migrations** :
```bash
cd BackEnd
php artisan migrate
```

⚠️ **ATTENTION** : La migration `create_appointments_v2_table` supprime l'ancienne table `appointments` !

2. **Créer les controllers, routes, middleware, etc.**

3. **Exécuter les seeders** :
```bash
php artisan db:seed
```

---

## 📚 DOCUMENTATION COMPLÈTE

Tous les modèles et migrations sont créés. Les relations Eloquent sont définies dans les modèles.

**Pour continuer le développement, créez les controllers, routes et middleware selon vos besoins spécifiques.**

Souhaitez-vous que je crée maintenant tous les controllers, routes, middleware et seeders complets ?
