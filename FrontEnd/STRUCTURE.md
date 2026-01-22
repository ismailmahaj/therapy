# 📁 Structure Frontend - Therapy Center V1

## ✅ Fichiers créés

### Configuration
- ✅ `package.json` - Dépendances ajoutées (react-router-dom, axios, tailwindcss)
- ✅ `tailwind.config.js` - Configuration Tailwind avec thème médical
- ✅ `postcss.config.js` - Configuration PostCSS
- ✅ `.env.example` - Variables d'environnement
- ✅ `src/index.css` - Styles Tailwind

### Utilitaires (`src/utils/`)
- ✅ `jwt.ts` - Gestion du token JWT et utilisateur dans localStorage
- ✅ `api.ts` - Configuration Axios avec intercepteurs

### Services API (`src/services/`)
- ✅ `authService.ts` - Authentification (register, login, logout, verifyEmail, me)
- ✅ `appointmentService.ts` - Rendez-vous (getAll, getById, create, cancel)
- ✅ `paymentService.ts` - Paiements (createPaymentIntent, confirmPayment)
- ✅ `donationService.ts` - Donations (getAll, getById, create)
- ✅ `dashboardService.ts` - Dashboard (getOverview, getAppointments, getDonations)

### Hooks (`src/hooks/`)
- ✅ `useAuth.tsx` - Hook d'authentification avec contexte React

### Composants (`src/components/`)
- ✅ `Button.tsx` - Bouton réutilisable avec variants
- ✅ `Error.tsx` - Affichage des erreurs
- ✅ `Loading.tsx` - Indicateur de chargement
- ✅ `Layout.tsx` - Layout principal avec sidebar et header

### Pages (`src/pages/`)
- ✅ `Login.tsx` - Page de connexion
- ✅ `Register.tsx` - Page d'inscription
- ✅ `VerifyEmail.tsx` - Vérification email
- ✅ `Dashboard.tsx` - Tableau de bord utilisateur
- ✅ `Appointments.tsx` - Liste des rendez-vous
- ✅ `NewAppointment.tsx` - Prise de rendez-vous Hijama
- ✅ `Donations.tsx` - Gestion des donations

### Router (`src/router/`)
- ✅ `AppRouter.tsx` - Configuration des routes avec protection

### Fichiers principaux
- ✅ `src/App.tsx` - Composant principal avec AuthProvider
- ✅ `src/main.tsx` - Point d'entrée (existant, non modifié)

## 🎨 Design

### Couleurs Tailwind
- **Primary** : Bleu (confiance, professionnalisme)
  - 50-900 : Nuances de bleu
- **Medical** : Vert (santé, bien-être)
  - 50-900 : Nuances de vert

### Composants réutilisables
- `.btn-primary` - Bouton principal
- `.btn-secondary` - Bouton secondaire
- `.card` - Carte avec ombre
- `.input` - Champ de formulaire
- `.label` - Label de formulaire

## 🔐 Sécurité

### Protection des routes
- Routes publiques : `/login`, `/register`, `/verify-email`
- Routes protégées : Toutes les autres routes nécessitent authentification
- Redirection automatique si non authentifié

### Gestion JWT
- Token stocké dans `localStorage`
- Ajout automatique dans les headers via intercepteur Axios
- Déconnexion automatique en cas d'erreur 401

## 📡 Intégration API

### Base URL
Configurée via `VITE_API_URL` dans `.env`

### Endpoints utilisés
- `POST /api/register` - Inscription
- `POST /api/login` - Connexion
- `POST /api/logout` - Déconnexion
- `GET /api/me` - Profil utilisateur
- `POST /api/verify-email` - Vérification email
- `GET /api/appointments` - Liste rendez-vous
- `POST /api/appointments` - Créer rendez-vous
- `POST /api/appointments/:id/cancel` - Annuler rendez-vous
- `POST /api/payments/create-intent` - Créer PaymentIntent
- `POST /api/payments/confirm` - Confirmer paiement
- `GET /api/donations` - Liste donations
- `POST /api/donations` - Créer donation
- `GET /api/dashboard` - Dashboard overview

## 💳 Stripe

### Configuration actuelle
- PaymentIntent créé côté backend
- `client_secret` reçu
- **TODO** : Intégration complète avec `@stripe/stripe-js` et `@stripe/react-stripe-js`

### Pour intégrer Stripe complètement
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

Puis utiliser `StripeElements` dans `NewAppointment.tsx` et `Donations.tsx`.

## 🚀 Prochaines étapes

1. **Installer les dépendances**
   ```bash
   npm install
   ```

2. **Configurer `.env`**
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_STRIPE_PUBLIC_KEY=pk_test_...
   ```

3. **Démarrer le serveur**
   ```bash
   npm run dev
   ```

4. **Tester l'application**
   - Inscription → Vérification email → Connexion
   - Créer un rendez-vous
   - Faire une donation

## 📝 Notes importantes

- Tous les composants sont en TypeScript
- Gestion d'erreurs complète avec affichage utilisateur
- Loading states sur toutes les actions asynchrones
- Design responsive (mobile-first)
- Accessibilité de base (labels, aria)

## 🎯 Fonctionnalités V1

✅ Authentification complète (register, login, verify email)  
✅ Dashboard utilisateur  
✅ Gestion des rendez-vous (liste, création, annulation)  
✅ Prise de rendez-vous avec calcul prix en temps réel  
✅ Gestion des donations  
✅ Protection des routes  
✅ Gestion JWT automatique  
✅ Design médical et rassurant  
✅ Responsive  

---

**Frontend V1 prêt pour le développement ! 🚀**
