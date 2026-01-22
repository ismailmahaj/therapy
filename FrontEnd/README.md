# Therapy Center - Frontend React

Application React pour Therapy Center - Version V1 (MVP)

## 🚀 Installation

### 1. Installer les dépendances

```bash
cd FrontEnd
npm install
```

### 2. Configurer l'environnement

Créez un fichier `.env` à partir de `.env.example` :

```env
VITE_API_URL=http://localhost:8000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_votre_cle_publique_stripe
```

### 3. Démarrer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📦 Dépendances principales

- **React 19** - Bibliothèque UI
- **React Router 7** - Routage
- **Axios** - Client HTTP
- **Tailwind CSS** - Framework CSS
- **TypeScript** - Typage statique

## 📁 Structure du projet

```
src/
├── components/          # Composants réutilisables
│   ├── Button.tsx
│   ├── Error.tsx
│   ├── Layout.tsx
│   └── Loading.tsx
├── hooks/              # Hooks personnalisés
│   └── useAuth.tsx
├── pages/              # Pages de l'application
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── VerifyEmail.tsx
│   ├── Dashboard.tsx
│   ├── Appointments.tsx
│   ├── NewAppointment.tsx
│   └── Donations.tsx
├── router/             # Configuration du router
│   └── AppRouter.tsx
├── services/           # Services API
│   ├── authService.ts
│   ├── appointmentService.ts
│   ├── paymentService.ts
│   ├── donationService.ts
│   └── dashboardService.ts
├── utils/             # Utilitaires
│   ├── api.ts
│   └── jwt.ts
├── App.tsx
└── main.tsx
```

## 🔐 Authentification

L'application utilise JWT stocké dans `localStorage`. Le token est automatiquement ajouté aux requêtes API via un intercepteur Axios.

## 🛣️ Routes

### Publiques
- `/login` - Connexion
- `/register` - Inscription
- `/verify-email` - Vérification email

### Protégées (nécessitent authentification)
- `/dashboard` - Tableau de bord
- `/appointments` - Liste des rendez-vous
- `/appointments/new` - Prendre un rendez-vous
- `/donations` - Donations

## 💳 Intégration Stripe

Pour une intégration complète de Stripe, installez :

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

Puis utilisez `StripeElements` dans les pages de paiement.

## 🎨 Design

L'application utilise Tailwind CSS avec une palette de couleurs médicale et rassurante :
- **Primary** : Bleu (confiance, professionnalisme)
- **Medical** : Vert (santé, bien-être)

## 📝 Notes

- Les erreurs API sont gérées automatiquement
- Le token JWT est renouvelé automatiquement
- Les routes sont protégées par défaut
- Le design est responsive

## 🔧 Scripts disponibles

- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualise le build de production
- `npm run lint` - Vérifie le code avec ESLint

## 📚 Documentation API

Consultez la documentation de l'API backend dans `BackEnd/API_DOCUMENTATION.md`
