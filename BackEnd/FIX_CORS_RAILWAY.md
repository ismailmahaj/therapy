# 🔧 Correction CORS pour Railway

## ❌ Erreur actuelle

```
Access to XMLHttpRequest at 'https://backend-laravel-production-db46.up.railway.app/api/login' 
from origin 'https://therapy-production-4d33.up.railway.app' 
has been blocked by CORS policy
```

## ✅ Solution : Configurer FRONTEND_URL dans Railway

### Étape 1 : Trouver l'URL de votre frontend

Dans Railway :
1. Service **frontend** → **Settings** → **Networking**
2. Copiez l'URL publique (ex: `https://therapy-production-4d33.up.railway.app`)

### Étape 2 : Configurer FRONTEND_URL dans le service backend

Dans Railway :
1. Service **backend** → **Settings** → **Variables**
2. Cherchez `FRONTEND_URL`
3. Si elle n'existe pas, créez-la :
   - Cliquez sur **+ New Variable**
   - Nom : `FRONTEND_URL`
   - Valeur : `https://therapy-production-4d33.up.railway.app`
   - (Remplacez par votre URL frontend réelle)
4. Si elle existe, modifiez-la pour pointer vers votre frontend Railway

### Étape 3 : Redéployer le backend

Après modification :
- Service backend → **Deployments** → **Redeploy**
- Attendez la fin du déploiement

## 🔍 Vérification

Après redéploiement :
1. Essayez de vous connecter depuis le frontend
2. Plus d'erreur CORS !

## 📝 Configuration automatique

J'ai aussi modifié `config/cors.php` pour :
- Autoriser automatiquement toutes les URLs Railway (`*.up.railway.app`)
- Utiliser `FRONTEND_URL` si configuré

## ⚙️ Variables à configurer dans Railway (backend)

```env
FRONTEND_URL=https://therapy-production-4d33.up.railway.app
APP_URL=https://backend-laravel-production-db46.up.railway.app
```

## 🚨 Si le problème persiste

Vérifiez que :
1. `FRONTEND_URL` est bien configurée dans Railway (service backend)
2. Le backend a été redéployé après modification
3. Les deux URLs utilisent `https://` (pas `http://`)

---

**Configurez FRONTEND_URL et redéployez le backend ! 🚀**
