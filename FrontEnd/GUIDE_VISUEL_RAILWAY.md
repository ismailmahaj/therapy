# 🎯 Guide visuel : Corriger VITE_API_URL dans Railway

## 📍 Où trouver l'URL publique de votre backend

### Option 1 : Dans Settings → Networking

1. Dans Railway, cliquez sur votre **service backend**
2. Cliquez sur l'onglet **Settings** (en haut)
3. Faites défiler jusqu'à la section **Networking** ou **Domains**
4. Vous verrez quelque chose comme :

```
Public Domain
https://backend-laravel-production-xxxx.up.railway.app
```

**Copiez cette URL !**

### Option 2 : Dans l'onglet "Deployments"

1. Service backend → **Deployments** (en haut)
2. Cliquez sur le **dernier déploiement**
3. Faites défiler les logs
4. Cherchez une ligne comme :
   ```
   Server running on https://backend-laravel-production-xxxx.up.railway.app
   ```

### Option 3 : Tester dans le navigateur

Essayez d'ouvrir ces URLs dans votre navigateur :

```
https://backend-laravel-production.up.railway.app/health
https://backend-laravel.up.railway.app/health
```

Si l'une d'elles répond, c'est votre URL publique !

## 🔧 Comment modifier VITE_API_URL

### Étape 1 : Aller dans le service frontend

1. Dans Railway, cliquez sur votre **service frontend**
2. Cliquez sur **Settings** (en haut)

### Étape 2 : Ouvrir les Variables

1. Dans Settings, cliquez sur **Variables** (dans le menu de gauche ou faites défiler)
2. Vous verrez la liste de toutes les variables d'environnement

### Étape 3 : Trouver VITE_API_URL

1. Cherchez `VITE_API_URL` dans la liste
2. Vous verrez sa valeur actuelle : `https://backend-laravel.railway.internal:8080/api`

### Étape 4 : Modifier la valeur

1. **Cliquez sur la valeur** de `VITE_API_URL` (ou sur le crayon/icône d'édition)
2. **Supprimez** l'ancienne valeur
3. **Tapez** la nouvelle valeur :
   ```
   https://VOTRE-URL-PUBLIQUE.up.railway.app/api
   ```
   
   **Exemple** (remplacez par votre URL réelle) :
   ```
   https://backend-laravel-production-a1b2c3.up.railway.app/api
   ```

4. **Cliquez sur Save** ou **Update**

### Étape 5 : Redéployer (OBLIGATOIRE)

1. Allez dans l'onglet **Deployments** (en haut)
2. Cliquez sur **Redeploy** ou **Deploy Latest**
3. Attendez la fin du déploiement (2-5 minutes)

## ✅ Vérification

Après le redéploiement :

1. Ouvrez votre frontend dans le navigateur
2. Appuyez sur **F12** (console développeur)
3. Vous devriez voir :
   ```
   🌐 API Base URL configurée: https://votre-backend.up.railway.app/api
   📦 VITE_API_URL depuis env: https://votre-backend.up.railway.app/api
   ```
4. **Plus d'erreur** "URL interne Railway" !

## 🚨 Si vous ne trouvez pas l'URL publique

### Vérifiez que votre backend est bien déployé

1. Service backend → **Deployments**
2. Vérifiez que le dernier déploiement est **"Active"** (vert)
3. Si ce n'est pas le cas, attendez la fin du déploiement

### Vérifiez les logs

1. Service backend → **Deployments** → Dernier déploiement
2. Regardez les logs, vous devriez voir l'URL quelque part

### Créer un domaine public

Si vous ne voyez pas de domaine public :

1. Service backend → **Settings** → **Networking**
2. Cherchez **"Generate Domain"** ou **"Add Domain"**
3. Railway générera automatiquement un domaine public gratuit

## 📝 Format de l'URL correcte

✅ **BON** :
```
https://backend-laravel-production-xxxx.up.railway.app/api
```

❌ **MAUVAIS** :
```
https://backend-laravel.railway.internal:8080/api  ← URL interne
http://backend-laravel.up.railway.app/api          ← HTTP au lieu de HTTPS
backend-laravel.up.railway.app/api                 ← Manque https://
```

## 💡 Astuce

Si vous avez plusieurs services backend, vérifiez que vous utilisez le bon :
- Celui qui contient votre application Laravel
- Celui qui a le Dockerfile
- Celui qui expose l'API

---

**Suivez ces étapes et votre frontend communiquera correctement avec le backend ! 🚀**
