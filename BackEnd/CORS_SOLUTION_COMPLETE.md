# 🔧 Solution complète CORS Railway

## ❌ Erreur actuelle

```
Access to XMLHttpRequest blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present
```

## ✅ Solution en 3 étapes

### Étape 1 : Vérifier la configuration CORS

La configuration CORS a été mise à jour pour autoriser automatiquement toutes les URLs Railway (`*.up.railway.app`).

### Étape 2 : Configurer les variables d'environnement dans Railway

Dans Railway, service **backend** → **Settings** → **Variables**, ajoutez :

```env
FRONTEND_URL=https://therapy-production-4d33.up.railway.app
APP_URL=https://backend-laravel-production-db46.up.railway.app
APP_ENV=production
```

**Important** : Remplacez par vos URLs réelles !

### Étape 3 : Redéployer le backend (OBLIGATOIRE)

⚠️ **CRITIQUE** : Après avoir modifié la configuration, vous **DEVEZ** redéployer le backend !

1. Service backend → **Deployments**
2. Cliquez sur **Redeploy** ou **Deploy Latest**
3. Attendez la fin du déploiement

## 🔍 Vérification

Après redéploiement :

1. Ouvrez votre frontend
2. Essayez de vous connecter
3. Plus d'erreur CORS !

## 🚨 Si le problème persiste

### Option 1 : Vider le cache Laravel

Si vous avez accès au conteneur, exécutez :
```bash
php artisan config:clear
php artisan cache:clear
```

### Option 2 : Vérifier les logs Railway

1. Service backend → **Deployments** → Dernier déploiement → **Logs**
2. Cherchez des erreurs liées à CORS

### Option 3 : Tester directement l'API

Testez dans votre navigateur ou avec curl :
```bash
curl -X OPTIONS https://backend-laravel-production-db46.up.railway.app/api/login \
  -H "Origin: https://therapy-production-4d33.up.railway.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Vous devriez voir les headers CORS dans la réponse.

## 📝 Configuration CORS actuelle

La configuration autorise :
- ✅ Toutes les URLs Railway (`*.up.railway.app`)
- ✅ `FRONTEND_URL` si configurée
- ✅ `APP_URL` si configurée
- ✅ Toutes les méthodes HTTP (`*`)
- ✅ Tous les headers (`*`)

## 💡 Note importante

Le middleware CORS est déjà configuré dans `bootstrap/app.php` :
```php
$middleware->api(prepend: [
    \Illuminate\Http\Middleware\HandleCors::class,
]);
```

Si le problème persiste après redéploiement, vérifiez que cette ligne est bien présente.

---

**Configurez les variables, redéployez le backend, et le problème CORS sera résolu ! 🚀**
