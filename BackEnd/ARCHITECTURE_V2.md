# Architecture V2 - Therapy Center avec Rôles Spécialisés

## 📋 Structure Complète des Fichiers à Créer

Ce document liste tous les fichiers nécessaires pour l'architecture V2 avec rôles spécialisés.

## ⚠️ IMPORTANT - Migration depuis V1

La nouvelle architecture est différente de V1. Vous avez deux options :

### Option 1 : Nouvelle Installation (Recommandé pour tests)
```bash
cd BackEnd
php artisan migrate:fresh
php artisan db:seed
```

### Option 2 : Migration Progressive
Les migrations sont conçues pour être compatibles avec la structure existante.

---

## 📁 FICHIERS À CRÉER/MODIFIER

### 1. Migrations (déjà créées)
- ✅ `2024_01_01_000005_create_roles_table.php`
- ✅ `2024_01_01_000006_create_therapy_slots_table.php`
- ✅ `2024_01_01_000007_create_donation_projects_table.php`
- ✅ `2024_01_01_000008_modify_appointments_table.php`
- ✅ `2024_01_01_000009_create_donation_contributions_table.php`
- ✅ `2024_01_01_000010_remove_old_columns_appointments.php`

### 2. Modèles (à créer/mettre à jour)
- ✅ `Role.php` (créé)
- ✅ `TherapySlot.php` (créé)
- ✅ `DonationProject.php` (créé)
- ✅ `DonationContribution.php` (créé)
- ⚠️ `User.php` (à modifier - ajouter relation roles)
- ⚠️ `Appointment.php` (à modifier - nouvelle structure)

### 3. Controllers (à créer)
- `TherapySlotController.php`
- `DonationProjectController.php`
- `ClientAppointmentController.php`
- `ClientDonationController.php`

### 4. Middleware (à créer)
- `RoleMiddleware.php` (déjà existe, à modifier)
- `HasRoleMiddleware.php` (nouveau)

### 5. Routes (à créer)
- Routes dans `routes/api.php`

### 6. Seeders (à créer)
- `RoleSeeder.php`
- `DatabaseSeeder.php` (à modifier)

---

## 🚀 ORDRE D'EXÉCUTION

1. Exécuter les migrations
2. Exécuter les seeders
3. Tester l'API

---

Consultez les fichiers suivants pour le code complet de chaque composant.
