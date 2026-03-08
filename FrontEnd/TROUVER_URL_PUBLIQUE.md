# 🔍 Trouver l'URL publique de votre backend Railway

## ❌ Ce que vous voyez actuellement

Vous voyez dans **Private Networking** :
```
backend-laravel.railway.internal
```

C'est l'URL **interne** - elle ne fonctionne **PAS** depuis le navigateur !

## ✅ Ce qu'il faut trouver : l'URL publique

Vous devez chercher l'URL **publique** qui ressemble à :
```
https://backend-laravel-production-xxxx.up.railway.app
```

## 📍 Où trouver l'URL publique

### Méthode 1 : Dans Settings → Networking

1. Dans Railway, service **backend**
2. **Settings** → **Networking**
3. Cherchez une section **"Public Domain"** ou **"Custom Domain"**
4. Vous devriez voir quelque chose comme :

```
Public Domain
https://backend-laravel-production-xxxx.up.railway.app
```

### Méthode 2 : Dans l'onglet "Deployments"

1. Service backend → **Deployments** (en haut)
2. Cliquez sur le **dernier déploiement** (celui qui est actif)
3. Faites défiler les **logs**
4. Cherchez une ligne qui contient :
   ```
   Server running on https://...
   ```
   ou
   ```
   Listening on https://...
   ```

### Méthode 3 : Dans l'onglet "Settings" → "General"

1. Service backend → **Settings** → **General**
2. Cherchez **"Public URL"** ou **"Domain"**
3. L'URL publique devrait être affichée là

### Méthode 4 : Tester différentes URLs

Essayez d'ouvrir ces URLs dans votre navigateur :

```
https://backend-laravel-production.up.railway.app/health
https://backend-laravel.up.railway.app/health
https://backend-laravel-production-xxxx.up.railway.app/health
```

Si l'une d'elles répond (affiche "healthy" ou une réponse JSON), c'est votre URL publique !

### Méthode 5 : Générer un domaine public

Si vous ne voyez pas de domaine public :

1. Service backend → **Settings** → **Networking**
2. Cherchez un bouton **"Generate Domain"** ou **"Add Domain"**
3. Cliquez dessus
4. Railway générera automatiquement un domaine public gratuit

## 🎯 Format de l'URL publique

L'URL publique Railway ressemble toujours à :
```
https://[nom-service]-[environnement]-[id].up.railway.app
```

Exemples :
- `https://backend-laravel-production-a1b2c3.up.railway.app`
- `https://backend-laravel-production.up.railway.app`
- `https://backend-laravel.up.railway.app`

## ⚠️ Différence importante

| Type | URL | Utilisation |
|------|-----|------------|
| **Interne** | `backend-laravel.railway.internal` | ❌ Ne fonctionne PAS depuis le navigateur |
| **Publique** | `https://backend-laravel-production-xxxx.up.railway.app` | ✅ Fonctionne depuis le navigateur |

## 📝 Une fois que vous avez l'URL publique

1. **Copiez l'URL publique** (sans le `/health` si vous l'avez testée)
2. **Ajoutez `/api`** à la fin
3. **Configurez dans Railway** (service frontend → Settings → Variables → VITE_API_URL) :
   ```env
   https://backend-laravel-production-xxxx.up.railway.app/api
   ```
4. **Redéployez le frontend**

---

**Cherchez dans les sections mentionnées ci-dessus et vous trouverez l'URL publique ! 🚀**
