# 📅 Installation FullCalendar

## Installation des dépendances

Exécutez cette commande dans le dossier FrontEnd :

```bash
cd FrontEnd
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

## ✅ Fichiers créés

### Composants Calendrier
- `src/components/Calendar/TherapyCalendar.tsx` - Calendrier pour les thérapeutes
- `src/components/Calendar/ClientCalendar.tsx` - Calendrier pour les clients

### Pages
- `src/pages/therapy/CalendarView.tsx` - Vue calendrier pour thérapeutes
- `src/pages/AppointmentCalendar.tsx` - Vue calendrier pour clients

### Routes ajoutées
- `/therapy/calendar` - Calendrier des créneaux (thérapeutes)
- `/appointments/calendar` - Calendrier de réservation (clients)

## 🎯 Fonctionnalités

### Pour les Thérapeutes
- Vue mois/semaine/jour
- Affichage des créneaux avec statut (disponible/complet/annulé)
- Clic sur un créneau pour voir les détails
- Clic sur une date pour créer un créneau

### Pour les Clients
- Vue mois/semaine/jour
- Affichage uniquement des créneaux disponibles
- Clic sur un créneau pour réserver
- Intégration avec le formulaire de réservation

## 🚀 Utilisation

Après installation, les calendriers seront accessibles via :
- Menu thérapeute : "Calendrier"
- Menu client : "Calendrier"
