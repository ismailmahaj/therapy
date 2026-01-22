# 📅 Intégration FullCalendar - Guide d'installation

## 🚀 Installation

Exécutez cette commande dans le dossier `FrontEnd` :

```bash
cd FrontEnd
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

## ✅ Fichiers créés

### Composants Calendrier
- ✅ `src/components/Calendar/TherapyCalendar.tsx` - Calendrier pour les thérapeutes
- ✅ `src/components/Calendar/ClientCalendar.tsx` - Calendrier pour les clients

### Pages
- ✅ `src/pages/therapy/CalendarView.tsx` - Vue calendrier pour thérapeutes
- ✅ `src/pages/AppointmentCalendar.tsx` - Vue calendrier pour clients

### Routes ajoutées
- ✅ `/therapy/calendar` - Calendrier des créneaux (thérapeutes)
- ✅ `/appointments/calendar` - Calendrier de réservation (clients)

## 🎯 Fonctionnalités

### Pour les Thérapeutes (`/therapy/calendar`)
- 📅 Vue mois/semaine/jour
- 🎨 Affichage des créneaux avec couleurs :
  - 🔵 Bleu = Disponible
  - 🟠 Orange = Complet
  - 🔴 Rouge = Annulé
- 👆 Clic sur un créneau → Voir les détails
- 📍 Affichage : `réservations/max - prix`
- 📊 Légende des statuts

### Pour les Clients (`/appointments/calendar`)
- 📅 Vue mois/semaine/jour
- ✅ Affichage uniquement des créneaux disponibles
- 👆 Clic sur un créneau → Modal de réservation rapide
- 🔄 Redirection vers formulaire avec slot pré-sélectionné
- 📍 Affichage : `places restantes - prix`

## 🎨 Personnalisation

Les calendriers sont configurés avec :
- 🇫🇷 Locale française
- ⏰ Heures : 8h-20h
- 📅 Premier jour : Lundi
- 🎯 Durée des créneaux : 30 minutes (vue semaine/jour)

## 📱 Navigation

### Menu Thérapeute
- **Calendrier** → Vue calendrier complète
- **Mes Créneaux** → Liste + formulaire
- **Disponibilités** → Disponibilités récurrentes

### Menu Client
- **Calendrier** → Vue calendrier de réservation
- **Prendre RDV** → Formulaire classique
- **Mes Rendez-vous** → Liste des rendez-vous

## 🔗 Intégration

Les calendriers sont intégrés avec :
- ✅ API backend (`/therapy/slots`, `/client/therapy/slots/available`)
- ✅ Services frontend (`therapyService`, `appointmentService`)
- ✅ Navigation entre calendrier et formulaires
- ✅ Pré-sélection de slots depuis le calendrier

## 🎉 Prêt à utiliser !

Après installation des dépendances, les calendriers seront fonctionnels ! 🚀
