# 🔧 Correction URGENTE : URL API Railway

## ❌ Erreur actuelle

```
POST https://backend-laravel.railway.internal:8080/api/login 
net::ERR_NAME_NOT_RESOLVED
```

**Cause** : La variable `VITE_API_URL` dans Railway pointe vers une URL interne qui n'est pas accessible depuis le navigateur.

## ✅ Solution étape par étape

### Étape 1 : Trouver l'URL publique HTTPS de votre backend

1. Dans Railway, allez dans votre service **backend** (celui qui contient votre application Laravel)
2. Cliquez sur l'onglet **Settings**
3. Cherchez la section **Networking** ou **Domains**
4. Copiez l'URL publique HTTPS complète
   - Format attendu : `https://votre-backend.up.railway.app`
   - ⚠️ **PAS** `http://backend-laravel.railway.internal:8080`

### Étape 2 : Configurer VITE_API_URL dans le service frontend

1. Dans Railway, allez dans votre service **frontend**
2. Cliquez sur **Settings** → **Variables**
3. Cherchez la variable `VITE_API_URL`
4. **Modifiez-la** ou **créez-la** avec cette valeur :

```env
VITE_API_URL=https://VOTRE-BACKEND.up.railway.app/api
```

**Remplacez `VOTRE-BACKEND` par le nom réel de votre backend Railway !**

Exemple :
```env
VITE_API_URL=https://backend-laravel-production.up.railway.app/api
```

### Étape 3 : Redéployer le frontend (OBLIGATOIRE)

⚠️ **CRITIQUE** : Après avoir modifié `VITE_API_URL`, vous **DEVEZ** redéployer le frontend car Vite injecte ces variables au moment du **build**.

**Option A : Redéploiement automatique (si connecté à GitHub)**
- Faites un commit et push de n'importe quel changement
- Railway redéploiera automatiquement

**Option B : Redéploiement manuel**
1. Dans Railway, service frontend
2. Onglet **Deployments**
3. Cliquez sur **Redeploy** ou **Deploy Latest**

### Étape 4 : Vérifier

Après le redéploiement :
1. Ouvrez votre frontend dans le navigateur
2. Ouvrez la console développeur (F12)
3. Vérifiez que l'URL utilisée est maintenant `https://votre-backend.up.railway.app/api/login`
4. Plus d'erreur `ERR_NAME_NOT_RESOLVED`

## 📋 Checklist de vérification

- [ ] URL backend publique HTTPS trouvée dans Railway
- [ ] `VITE_API_URL` configurée avec l'URL HTTPS publique + `/api`
- [ ] URL ne contient **PAS** `railway.internal`
- [ ] URL commence par `https://`
- [ ] Frontend redéployé après modification
- [ ] Erreur `ERR_NAME_NOT_RESOLVED` disparue

## 🔍 Comment vérifier que c'est corrigé

Dans la console du navigateur, vous devriez voir :
- ✅ `🔧 API Base URL: https://votre-backend.up.railway.app/api`
- ❌ Plus d'erreur `ERR_NAME_NOT_RESOLVED`
- ❌ Plus d'erreur "Mixed Content"

## 🚨 Erreurs courantes

### ❌ MAUVAIS
```env
VITE_API_URL=http://backend-laravel.railway.internal:8080/api
```
**Problème** : URL interne, non accessible depuis le navigateur

### ❌ MAUVAIS
```env
VITE_API_URL=http://votre-backend.up.railway.app/api
```
**Problème** : HTTP au lieu de HTTPS (causera "Mixed Content")

### ✅ BON
```env
VITE_API_URL=https://votre-backend.up.railway.app/api
```
**Solution** : URL publique HTTPS

## 💡 Si vous ne trouvez pas l'URL publique

Si vous ne voyez pas l'URL publique dans Railway :

1. Vérifiez que votre service backend a un **domaine public** configuré
2. Dans Railway, service backend → **Settings** → **Networking**
3. Si aucun domaine n'est configuré, Railway peut générer un domaine automatique
4. Ou configurez un domaine personnalisé

## 🆘 Si le problème persiste

1. Vérifiez dans la console du navigateur quelle URL est utilisée
2. Vérifiez que `VITE_API_URL` est bien définie dans Railway (service frontend)
3. Vérifiez que le frontend a été redéployé après la modification
4. Vérifiez les logs de build Railway pour voir si `VITE_API_URL` est bien injectée

---

**Après ces étapes, votre frontend devrait communiquer correctement avec le backend ! 🚀**
