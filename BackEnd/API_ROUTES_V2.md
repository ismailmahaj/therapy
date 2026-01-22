# 📡 Routes API V2 - Therapy Center

## 🔐 Authentification

Toutes les routes nécessitent `Authorization: Bearer {token}` sauf les routes publiques.

## 📋 ROUTES PUBLIQUES

```
POST   /api/register
POST   /api/login
POST   /api/verify-email
```

## 🎯 MODULE THERAPY (role:therapy)

### Gestion des Créneaux

```
GET    /api/therapy/slots
POST   /api/therapy/slots
GET    /api/therapy/slots/{id}
PATCH  /api/therapy/slots/{id}
DELETE /api/therapy/slots/{id}
GET    /api/therapy/slots/{id}/appointments
```

### Gestion des Rendez-vous

```
GET    /api/therapy/appointments
GET    /api/therapy/appointments/{id}
PATCH  /api/therapy/appointments/{id}/complete
```

## 📅 MODULE CALENDRIER (role:therapy)

### Paramètres

```
GET    /api/therapy/calendar/settings
PATCH  /api/therapy/calendar/settings
```

### Disponibilités Récurrentes

```
GET    /api/therapy/calendar/recurring-availabilities
POST   /api/therapy/calendar/recurring-availabilities
PATCH  /api/therapy/calendar/recurring-availabilities/{id}
DELETE /api/therapy/calendar/recurring-availabilities/{id}
```

### Génération de Créneaux

```
POST   /api/therapy/calendar/generate-slots
```

### Exceptions

```
GET    /api/therapy/calendar/exceptions
POST   /api/therapy/calendar/exceptions
PATCH  /api/therapy/calendar/exceptions/{id}
DELETE /api/therapy/calendar/exceptions/{id}
```

### Vue Calendrier

```
GET    /api/therapy/calendar/view?view=week&date=2026-02-15
```

## 💚 MODULE DONATION (role:donation)

```
GET    /api/donation/projects
POST   /api/donation/projects
GET    /api/donation/projects/{id}
PATCH  /api/donation/projects/{id}
DELETE /api/donation/projects/{id}
PATCH  /api/donation/projects/{id}/activate
```

## 👤 MODULE CLIENT - Appointments (role:client)

### Découverte

```
GET    /api/client/therapy/therapists
GET    /api/client/therapy/therapists/{id}/slots
GET    /api/client/therapy/slots/available
```

### Réservation

```
POST   /api/client/therapy/appointments
POST   /api/client/therapy/appointments/confirm-payment
GET    /api/client/therapy/appointments
GET    /api/client/therapy/appointments/{id}
PATCH  /api/client/therapy/appointments/{id}/cancel
```

## 💰 MODULE CLIENT - Donations (role:client)

```
GET    /api/client/donation/projects
GET    /api/client/donation/projects/{id}
POST   /api/client/donation/contributions
POST   /api/client/donation/contributions/confirm-payment
GET    /api/client/donation/contributions
```

## 👨‍💼 MODULE ADMIN (role:admin,superadmin)

```
GET    /api/admin/appointments
GET    /api/admin/users
GET    /api/admin/donations
```

---

Voir les fichiers de contrôleurs pour les détails de chaque endpoint.
