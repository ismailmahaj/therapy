# 🌐 Utiliser le domaine public gratuit Railway

## 💡 Bonne nouvelle !

Railway génère **automatiquement** un domaine public HTTPS gratuit pour chaque service. Vous n'avez **PAS besoin** d'acheter un nom de domaine pour tester !

## ❌ Pourquoi l'URL interne ne fonctionne pas

L'URL interne `backend-laravel.railway.internal:8080` :
- ✅ Fonctionne entre services Railway (backend ↔ backend)
- ❌ **NE FONCTIONNE PAS** depuis le navigateur du client
- ❌ Le navigateur ne peut pas résoudre les domaines `.railway.internal`

## ✅ Solution : Utiliser le domaine public gratuit Railway

### Étape 1 : Trouver l'URL publique de votre backend

1. Dans Railway, ouvrez votre service **backend**
2. Allez dans l'onglet **Settings**
3. Cherchez la section **Networking** ou **Domains**
4. Vous verrez une URL comme :
   ```
   https://backend-laravel-production-xxxx.up.railway.app
   ```
   C'est votre **domaine public gratuit** ! 🎉

### Étape 2 : Configurer VITE_API_URL avec cette URL

1. Dans Railway, ouvrez votre service **frontend**
2. Allez dans **Settings** → **Variables**
3. Configurez `VITE_API_URL` :

```env
VITE_API_URL=https://backend-laravel-production-xxxx.up.railway.app/api
```

**Remplacez `xxxx` par votre identifiant réel !**

### Étape 3 : Redéployer le frontend

Après avoir modifié `VITE_API_URL`, redéployez le frontend :
- Service frontend → **Deployments** → **Redeploy**

## 🔍 Comment trouver l'URL publique

### Méthode 1 : Dans Railway Dashboard

1. Service backend → **Settings** → **Networking**
2. Cherchez **Public Domain** ou **Custom Domain**
3. Copiez l'URL qui commence par `https://`

### Méthode 2 : Dans les logs Railway

1. Service backend → **Deployments** → Dernier déploiement
2. Cherchez dans les logs une ligne comme :
   ```
   Server running on https://backend-laravel-production-xxxx.up.railway.app
   ```

### Méthode 3 : Tester l'endpoint

Essayez d'accéder à :
```
https://votre-backend.up.railway.app/health
```

Si ça fonctionne, c'est votre URL publique !

## 📋 Exemple complet

Si votre backend Railway a cette URL publique :
```
https://backend-laravel-production-a1b2c3.up.railway.app
```

Alors configurez dans le service frontend :
```env
VITE_API_URL=https://backend-laravel-production-a1b2c3.up.railway.app/api
```

## 🎯 Avantages du domaine public gratuit

- ✅ **Gratuit** - Pas besoin d'acheter un nom de domaine
- ✅ **HTTPS automatique** - Certificat SSL inclus
- ✅ **Accessible depuis n'importe où** - Fonctionne depuis le navigateur
- ✅ **Parfait pour les tests** - Idéal pour le développement et les tests

## 🔄 Plus tard : Nom de domaine personnalisé

Quand vous serez prêt, vous pourrez :
1. Acheter un nom de domaine (ex: `hijama.com`)
2. Dans Railway, service backend → **Settings** → **Networking**
3. Ajouter votre domaine personnalisé
4. Railway configurera automatiquement le SSL

Mais pour l'instant, le domaine gratuit Railway suffit parfaitement ! 🚀

## ⚠️ Important

- L'URL interne `*.railway.internal` ne fonctionnera **JAMAIS** depuis le navigateur
- Vous **DEVEZ** utiliser l'URL publique `*.up.railway.app`
- C'est gratuit et automatique, pas besoin d'acheter quoi que ce soit

---

**Utilisez le domaine public gratuit Railway pour vos tests, c'est parfait ! 🎉**
