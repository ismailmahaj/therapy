# 👨‍💼 Guide Admin - Gestion des Créneaux

## ✅ Compte Admin

Le compte admin existe déjà et peut être créé via le seeder :

**Email:** `admin@therapycenter.com`  
**Mot de passe:** `password`  
**Rôle:** `admin`

Pour créer les comptes admin :
```bash
cd BackEnd
php artisan db:seed
```

## 🎯 Fonctionnalités Admin

### 1. Gestion des Créneaux de Disponibilité

L'admin peut créer, modifier et supprimer des créneaux de disponibilité pour hommes et femmes.

#### Endpoints API :

- `GET /api/admin/availability-slots` - Liste tous les créneaux
  - Query params : `date`, `gender`, `available`
- `POST /api/admin/availability-slots` - Créer un créneau
- `PUT /api/admin/availability-slots/{id}` - Modifier un créneau
- `DELETE /api/admin/availability-slots/{id}` - Supprimer un créneau

#### Exemple de création :

```json
POST /api/admin/availability-slots
{
  "date": "2024-12-25",
  "start_time": "09:00",
  "end_time": "10:00",
  "gender": "homme",
  "max_appointments": 2
}
```

### 2. Gestion des Utilisateurs

- `GET /api/admin/users` - Liste tous les utilisateurs
- `GET /api/admin/appointments` - Liste tous les rendez-vous
- `GET /api/admin/donations` - Liste toutes les donations

## 🖥️ Interface Frontend Admin

### Page : Gestion des Créneaux

**URL:** `/admin/availability-slots`

**Fonctionnalités :**
- ✅ Voir tous les créneaux (avec filtres par date et sexe)
- ✅ Créer un nouveau créneau
- ✅ Activer/Désactiver un créneau
- ✅ Supprimer un créneau
- ✅ Voir le nombre de rendez-vous par créneau

## 📋 Table : availability_slots

Structure de la table :

- `id` - ID du créneau
- `date` - Date du créneau
- `start_time` - Heure de début
- `end_time` - Heure de fin
- `gender` - Sexe (homme/femme)
- `is_available` - Disponibilité
- `max_appointments` - Nombre maximum de rendez-vous
- `current_appointments` - Nombre actuel de rendez-vous

## 🔒 Sécurité

Les routes admin sont protégées par :
1. Middleware `auth:api` - Authentification JWT requise
2. Middleware `role:admin,superadmin` - Rôle admin ou superadmin requis

## 📝 Workflow

### Pour l'Admin :

1. **Se connecter** avec `admin@therapycenter.com / password`
2. **Accéder à** `/admin/availability-slots`
3. **Créer des créneaux** pour chaque jour et sexe
4. Les utilisateurs pourront alors prendre rendez-vous sur ces créneaux

### Pour l'Utilisateur :

1. Prendre rendez-vous sur `/appointments/new`
2. Le système vérifie automatiquement si le créneau existe et est disponible
3. Si disponible, le rendez-vous est créé et le compteur du créneau est incrémenté

## 🚀 Migration

Pour activer cette fonctionnalité :

```bash
cd BackEnd
php artisan migrate
```

## 🎨 Exemple d'utilisation

### Créer un créneau pour hommes le 25 décembre de 9h à 12h :

```json
POST /api/admin/availability-slots
{
  "date": "2024-12-25",
  "start_time": "09:00",
  "end_time": "12:00",
  "gender": "homme",
  "max_appointments": 3
}
```

### Créer un créneau pour femmes le même jour :

```json
POST /api/admin/availability-slots
{
  "date": "2024-12-25",
  "start_time": "14:00",
  "end_time": "17:00",
  "gender": "femme",
  "max_appointments": 5
}
```

## ✅ Notes Importantes

- Un créneau ne peut pas être supprimé s'il contient des rendez-vous
- Le compteur `current_appointments` est incrémenté automatiquement lors de la création d'un rendez-vous
- Un créneau devient indisponible automatiquement quand `current_appointments >= max_appointments`
- Les créneaux peuvent être activés/désactivés manuellement par l'admin
