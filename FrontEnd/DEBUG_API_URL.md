# 🔍 Débogage : ERR_NAME_NOT_RESOLVED

## 📋 Étapes de diagnostic

### Étape 1 : Vérifier l'URL utilisée dans le navigateur

1. Ouvrez votre frontend dans le navigateur
2. Appuyez sur **F12** pour ouvrir la console développeur
3. Regardez les messages de console, vous devriez voir :
   ```
   🌐 API Base URL configurée: [URL]
   📦 VITE_API_URL depuis env: [URL]
   ```

4. **Copiez l'URL affichée** - c'est celle qui est utilisée

### Étape 2 : Identifier le problème

#### ❌ Si vous voyez une URL interne :
```
backend-laravel.railway.internal:8080
```
**Problème** : `VITE_API_URL` pointe vers une URL interne

#### ❌ Si vous voyez `localhost:8000` :
```
http://localhost:8000/api
```
**Problème** : `VITE_API_URL` n'est pas définie ou utilise la valeur par défaut

#### ❌ Si vous voyez `undefined` :
```
undefined
```
**Problème** : `VITE_API_URL` n'est pas définie dans Railway

### Étape 3 : Vérifier la configuration Railway

#### Dans le service frontend :

1. **Settings** → **Variables**
2. Cherchez `VITE_API_URL`
3. Vérifiez qu'elle existe et contient :
   ```env
   VITE_API_URL=https://votre-backend.up.railway.app/api
   ```

#### Si `VITE_API_URL` n'existe pas :

1. Cliquez sur **+ New Variable**
2. Nom : `VITE_API_URL`
3. Valeur : `https://votre-backend.up.railway.app/api`
4. Cliquez sur **Add**

### Étape 4 : Trouver l'URL publique de votre backend

#### Méthode 1 : Dans Railway Dashboard

1. Service **backend** → **Settings** → **Networking**
2. Cherchez **Public Domain** ou **Custom Domain**
3. L'URL ressemble à : `https://backend-laravel-production-xxxx.up.railway.app`

#### Méthode 2 : Dans les logs Railway

1. Service **backend** → **Deployments** → Dernier déploiement
2. Cherchez dans les logs une ligne avec l'URL publique

#### Méthode 3 : Tester directement

Essayez d'accéder à cette URL dans votre navigateur :
```
https://votre-backend.up.railway.app/health
```

Si ça fonctionne, c'est votre URL publique !

### Étape 5 : Configurer correctement VITE_API_URL

Une fois que vous avez l'URL publique de votre backend :

1. Dans Railway, service **frontend** → **Settings** → **Variables**
2. Modifiez ou créez `VITE_API_URL` :
   ```env
   VITE_API_URL=https://VOTRE-BACKEND.up.railway.app/api
   ```
   
   **Exemple réel** :
   ```env
   VITE_API_URL=https://backend-laravel-production-a1b2c3.up.railway.app/api
   ```

### Étape 6 : Redéployer le frontend (OBLIGATOIRE)

⚠️ **CRITIQUE** : Après avoir modifié `VITE_API_URL`, vous **DEVEZ** redéployer !

1. Service **frontend** → **Deployments**
2. Cliquez sur **Redeploy** ou **Deploy Latest**
3. Attendez la fin du déploiement

### Étape 7 : Vérifier après redéploiement

1. Ouvrez votre frontend dans le navigateur
2. Ouvrez la console (F12)
3. Vérifiez que l'URL affichée est maintenant :
   ```
   https://votre-backend.up.railway.app/api
   ```
4. Plus d'erreur `ERR_NAME_NOT_RESOLVED`

## 🚨 Erreurs courantes et solutions

### Erreur : "VITE_API_URL n'est pas définie"

**Solution** : Créez la variable dans Railway (service frontend → Settings → Variables)

### Erreur : "URL interne Railway"

**Solution** : Utilisez l'URL publique `*.up.railway.app` au lieu de `*.railway.internal`

### Erreur : "localhost en production"

**Solution** : Configurez `VITE_API_URL` avec l'URL publique Railway

### Erreur : "HTTP au lieu de HTTPS"

**Solution** : Utilisez `https://` au lieu de `http://`

## 📝 Checklist complète

- [ ] Console navigateur ouverte (F12)
- [ ] URL utilisée identifiée dans la console
- [ ] URL publique backend trouvée dans Railway
- [ ] `VITE_API_URL` configurée dans Railway (service frontend)
- [ ] `VITE_API_URL` commence par `https://`
- [ ] `VITE_API_URL` se termine par `/api`
- [ ] `VITE_API_URL` ne contient PAS `railway.internal`
- [ ] Frontend redéployé après modification
- [ ] Nouvelle URL visible dans la console après redéploiement
- [ ] Plus d'erreur `ERR_NAME_NOT_RESOLVED`

## 💡 Astuce

Si vous ne trouvez pas l'URL publique de votre backend :
1. Vérifiez que votre service backend est bien déployé
2. Railway génère automatiquement un domaine public
3. Cherchez dans les logs de déploiement du backend

---

**Suivez ces étapes dans l'ordre et le problème sera résolu ! 🚀**
