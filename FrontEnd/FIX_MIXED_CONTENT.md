# 🔧 Correction de l'erreur Mixed Content

## ❌ Problème

L'erreur suivante apparaît :
```
Mixed Content: The page at 'https://therapy-production-4d33.up.railway.app/login' 
was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint 
'http://backend-laravel.railway.internal:8080/api/login'. 
This request has been blocked; the content must be served over HTTPS.
```

**Cause** : La variable d'environnement `VITE_API_URL` dans Railway pointe vers une URL HTTP interne au lieu de l'URL HTTPS publique du backend.

## ✅ Solution

### 1. Trouver l'URL publique HTTPS de votre backend

Dans Railway :
1. Allez dans votre service **backend**
2. Cliquez sur l'onglet **Settings**
3. Trouvez la section **Networking** ou **Domains**
4. Copiez l'URL publique HTTPS (ex: `https://votre-backend.up.railway.app`)

### 2. Configurer `VITE_API_URL` dans le service frontend

Dans Railway :
1. Allez dans votre service **frontend**
2. Cliquez sur l'onglet **Settings**
3. Allez dans **Variables**
4. Cherchez `VITE_API_URL`
5. **Modifiez-la** pour pointer vers l'URL HTTPS publique :

```env
VITE_API_URL=https://votre-backend.up.railway.app/api
```

⚠️ **IMPORTANT** : 
- Utilisez **HTTPS** (pas HTTP)
- Utilisez l'URL **publique** (pas l'URL interne `*.railway.internal`)
- Ajoutez `/api` à la fin de l'URL

### 3. Redéployer le frontend

**CRITIQUE** : Après avoir modifié `VITE_API_URL`, vous **DEVEZ** redéployer le frontend car Vite injecte ces variables au moment du **build**.

Options pour redéployer :
1. **Automatique** : Railway redéploie automatiquement si connecté à GitHub après un push
2. **Manuel** : Dans Railway, allez dans votre service frontend → **Deployments** → **Redeploy**

### 4. Vérifier la configuration

Après le redéploiement, vérifiez dans la console du navigateur :
- L'URL utilisée doit être `https://votre-backend.up.railway.app/api/login` (HTTPS)
- Plus d'erreur "Mixed Content"

## 📋 Checklist

- [ ] URL backend publique HTTPS trouvée
- [ ] `VITE_API_URL` configurée avec l'URL HTTPS publique + `/api`
- [ ] Frontend redéployé après modification
- [ ] Erreur "Mixed Content" disparue

## 🔍 Vérification dans le code

Le frontend utilise `VITE_API_URL` dans `src/utils/api.ts` :

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

Si `VITE_API_URL` n'est pas définie ou pointe vers une mauvaise URL, le frontend utilisera la valeur par défaut (`http://localhost:8000/api`) ou l'URL incorrecte.

## 🚨 Erreurs courantes

### ❌ Mauvaise URL
```env
VITE_API_URL=http://backend-laravel.railway.internal:8080/api
```
**Problème** : URL interne HTTP (ne fonctionne pas depuis le navigateur)

### ✅ Bonne URL
```env
VITE_API_URL=https://votre-backend.up.railway.app/api
```
**Solution** : URL publique HTTPS

## 💡 Note sur le WebSocket

L'erreur `WebSocket connection to 'ws://localhost:8081/' failed` est normale en production. C'est lié à un outil de développement (hot reload) qui n'est pas nécessaire en production. Vous pouvez l'ignorer.

---

**Après ces corrections, votre frontend devrait communiquer correctement avec le backend en HTTPS ! 🚀**
