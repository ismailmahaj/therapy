# 🚨 Correction immédiate : URL interne Railway

## ❌ Problème actuel

Votre `VITE_API_URL` est configurée avec :
```
https://backend-laravel.railway.internal:8080/api
```

Cette URL interne ne fonctionne **PAS** depuis le navigateur !

## ✅ Solution en 3 étapes

### Étape 1 : Trouver l'URL publique de votre backend

Dans Railway :

1. **Ouvrez votre service backend** (celui nommé "backend-laravel" ou similaire)
2. Allez dans l'onglet **Settings**
3. Cherchez la section **Networking** ou **Domains**
4. Vous devriez voir une URL comme :
   ```
   https://backend-laravel-production-xxxx.up.railway.app
   ```
   ou
   ```
   https://backend-laravel.up.railway.app
   ```

**Si vous ne voyez pas l'URL :**

#### Option A : Dans l'onglet "Deployments"
1. Service backend → **Deployments**
2. Cliquez sur le dernier déploiement
3. Regardez les logs, vous verrez quelque chose comme :
   ```
   Server running on https://backend-laravel-production-xxxx.up.railway.app
   ```

#### Option B : Tester directement
Essayez d'accéder à ces URLs dans votre navigateur :
- `https://backend-laravel-production.up.railway.app/health`
- `https://backend-laravel.up.railway.app/health`

Si l'une d'elles fonctionne, c'est votre URL publique !

### Étape 2 : Modifier VITE_API_URL dans Railway

1. Dans Railway, **ouvrez votre service frontend**
2. Allez dans **Settings** → **Variables**
3. **Trouvez** `VITE_API_URL` dans la liste
4. **Cliquez dessus** pour la modifier
5. **Remplacez** la valeur actuelle par :
   ```env
   https://VOTRE-URL-PUBLIQUE.up.railway.app/api
   ```

   **Exemple** (remplacez par votre URL réelle) :
   ```env
   https://backend-laravel-production-a1b2c3.up.railway.app/api
   ```

6. **Sauvegardez** la modification

### Étape 3 : Redéployer le frontend (OBLIGATOIRE)

⚠️ **IMPORTANT** : Après avoir modifié `VITE_API_URL`, vous **DEVEZ** redéployer !

1. Toujours dans le service frontend
2. Allez dans l'onglet **Deployments**
3. Cliquez sur **Redeploy** ou **Deploy Latest**
4. Attendez la fin du déploiement (2-5 minutes)

### Étape 4 : Vérifier

Après le redéploiement :

1. Ouvrez votre frontend dans le navigateur
2. Appuyez sur **F12** pour ouvrir la console
3. Vous devriez maintenant voir :
   ```
   🌐 API Base URL configurée: https://votre-backend.up.railway.app/api
   📦 VITE_API_URL depuis env: https://votre-backend.up.railway.app/api
   ```
4. Plus d'erreur "URL interne Railway" !
5. Plus d'erreur `ERR_NAME_NOT_RESOLVED` !

## 📋 Checklist rapide

- [ ] URL publique backend trouvée dans Railway
- [ ] `VITE_API_URL` modifiée avec l'URL publique + `/api`
- [ ] `VITE_API_URL` commence par `https://`
- [ ] `VITE_API_URL` se termine par `/api`
- [ ] `VITE_API_URL` ne contient **PAS** `railway.internal`
- [ ] Frontend redéployé après modification
- [ ] Console navigateur vérifiée après redéploiement

## 🔍 Comment savoir si c'est la bonne URL

L'URL publique Railway :
- ✅ Commence par `https://`
- ✅ Contient `.up.railway.app`
- ✅ **NE contient PAS** `railway.internal`
- ✅ **NE contient PAS** `:8080` ou un port

## 💡 Astuce

Si vous avez plusieurs services backend, vérifiez que vous utilisez le bon :
- Le service qui contient votre application Laravel
- Celui qui a le Dockerfile
- Celui qui expose l'API sur `/api`

---

**Suivez ces étapes et le problème sera résolu ! 🚀**
