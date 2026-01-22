# Guide d'Implémentation : Validation par Sexe

## 📋 Vue d'ensemble

Ce guide décrit l'implémentation de la logique métier stricte basée sur le sexe pour l'application Therapy Center (Hijama).

## 🗄️ Structure de la Base de Données

### Migrations créées

1. **`2024_01_03_000001_add_sexe_to_users_table.php`**
   - Ajoute le champ `sexe` (enum: homme/femme) à la table `users`
   - OBLIGATOIRE pour tous les utilisateurs

2. **`2024_01_03_000002_create_therapist_profiles_table.php`**
   - Table `therapist_profiles` pour les informations spécifiques aux thérapeutes
   - Champs : `sexe`, `hijama_types` (JSON), `autres_types`

3. **`2024_01_03_000003_add_sexe_and_hijama_to_therapy_slots_table.php`**
   - Ajoute `sexe_therapeute` et `hijama_type` aux créneaux
   - Automatiquement rempli lors de la création

4. **`2024_01_03_000004_add_persons_to_appointments_table.php`**
   - Ajoute `total_personnes` à `appointments`
   - Crée la table `appointment_persons` pour les personnes du rendez-vous

## 🔐 Règles de Validation

### 1. Inscription Utilisateur

**Tous les utilisateurs** doivent renseigner leur `sexe` lors de l'inscription :

```php
'sexe' => ['required', 'in:homme,femme']
```

### 2. Profil Thérapeute

Les utilisateurs avec le rôle `therapy` doivent créer un profil avec :
- `sexe` : homme ou femme
- `hijama_types` : tableau des types pratiqués
  - `hijama_seche`
  - `hijama_humide`
  - `hijama_sunnah`
  - `hijama_esthetique`
  - `autres` (avec champ texte `autres_types`)

### 3. Création de Créneaux

Lorsqu'un thérapeute crée un créneau :
- Le `sexe_therapeute` est **automatiquement** défini depuis son profil
- Le `hijama_type` doit être spécifié pour ce créneau

### 4. Réservation de Rendez-vous

**RÈGLE STRICTE** :
- Un client **HOMME** ne peut réserver qu'avec un thérapeute **HOMME**
- Une cliente **FEMME** ne peut réserver qu'avec une thérapeute **FEMME**

**Validation multi-personnes** :
- Toutes les personnes du rendez-vous doivent être du **même sexe**
- Toutes les personnes doivent être du **même sexe que le thérapeute**

## 🛠️ Services et Contrôleurs

### `AppointmentValidationService`

Service centralisé pour la validation :

```php
// Valider la compatibilité du sexe
$validation = $this->validationService->validateSexeCompatibility($slot, $persons);

// Valider qu'un client peut réserver
$validation = $this->validationService->validateClientCanBook($client, $slot, $persons);

// Filtrer les créneaux disponibles
$query = $this->validationService->filterAvailableSlots($query, $clientSexe, $hijamaType);
```

### Contrôleurs mis à jour

1. **`ClientAppointmentController`**
   - `store()` : Validation stricte avant création
   - `availableSlots()` : Filtrage automatique par sexe

2. **`TherapySlotController`**
   - `store()` : Remplissage automatique de `sexe_therapeute`

3. **`TherapistProfileController`** (nouveau)
   - Gestion du profil thérapeute
   - Endpoint : `POST /api/therapy/profile`

## 📝 FormRequests

### `RegisterRequest`
- Ajout de la validation `sexe` obligatoire

### `CreateAppointmentRequest`
- Validation des `persons` avec `prenom` et `sexe`
- Maximum 10 personnes par rendez-vous

### `CreateSlotRequest`
- Ajout de la validation `hijama_type` obligatoire

## 🔄 Flux de Réservation

1. **Client sélectionne une date**
   - Les créneaux sont filtrés automatiquement par son sexe

2. **Client sélectionne un créneau**
   - Vérification que le créneau est compatible

3. **Client renseigne les personnes**
   - Pour chaque personne : prénom + sexe
   - Validation que toutes les personnes sont du même sexe

4. **Validation finale**
   - Toutes les personnes = même sexe que le thérapeute
   - Nombre de places suffisant
   - Créneau toujours disponible

5. **Création du rendez-vous**
   - Création de l'`Appointment`
   - Création des `AppointmentPerson`
   - Création du `PaymentIntent` Stripe

## 🧪 Tests à Implémenter

### Tests Unitaires

```php
// Test : Validation du sexe
test('client homme ne peut pas réserver avec thérapeute femme')
test('toutes les personnes doivent être du même sexe')
test('toutes les personnes doivent être du même sexe que le thérapeute')

// Test : Filtrage des créneaux
test('créneaux filtrés par sexe du client')
test('créneaux filtrés par type de hijama')
```

### Tests Fonctionnels

```php
// Test : Création de rendez-vous
test('création réussie avec validation correcte')
test('échec si sexe incompatible')
test('échec si personnes de sexes différents')
```

## 🚀 Commandes à Exécuter

```bash
# Migrations
php artisan migrate

# Si besoin de rollback
php artisan migrate:rollback --step=4
```

## 📌 Points d'Attention

1. **Sécurité** : La validation se fait **côté backend** (obligatoire)
2. **UX** : Le filtrage côté frontend améliore l'expérience utilisateur
3. **Logs** : Les erreurs de validation sont loggées pour le debugging
4. **Messages** : Messages d'erreur clairs et explicites pour l'utilisateur

## 🔗 Routes API

### Nouveaux endpoints

```
POST   /api/therapy/profile          Créer/mettre à jour profil thérapeute
GET    /api/therapy/profile          Obtenir le profil thérapeute
```

### Endpoints mis à jour

```
POST   /api/client/therapy/appointments    Validation stricte ajoutée
GET    /api/client/therapy/slots/available  Filtrage par sexe ajouté
POST   /api/therapy/slots                  Remplissage automatique sexe_therapeute
```

## ✅ Checklist d'Implémentation

- [x] Migrations créées
- [x] Modèles mis à jour
- [x] Service de validation créé
- [x] FormRequests mis à jour
- [x] Contrôleurs mis à jour
- [x] Validation stricte implémentée
- [ ] Tests unitaires (à créer)
- [ ] Tests fonctionnels (à créer)
- [ ] Documentation frontend (à mettre à jour)

## 🎯 Prochaines Étapes

1. Mettre à jour le frontend pour :
   - Ajouter le champ `sexe` à l'inscription
   - Créer le formulaire de profil thérapeute
   - Afficher les personnes dans le formulaire de réservation
   - Filtrer les créneaux par sexe côté frontend

2. Créer les tests unitaires et fonctionnels

3. Ajouter des logs détaillés pour le debugging
