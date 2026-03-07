# 🔧 Correction de l'URL API pour Railway

## ❌ Problème

Votre frontend essaie de se connecter à `http://localhost:8000/api` au lieu de l'URL Railway de votre backend.

**Erreur** : `POST http://localhost:8000/api/register net::ERR_CONNECTION_REFUSED`

## ✅ Solution

### Option 1 : Via Variables d'Environnement Railway (Recommandé)

1. **Dans Railway, allez dans votre service Frontend**
2. **Settings** → **Variables**
3. **Ajoutez ou modifiez** :
   ```
   VITE_API_URL=https://votre-backend.up.railway.app/api
   ```
   ⚠️ Remplacez `votre-backend.up.railway.app` par l'URL réelle de votre backend Railway

4. **Redéployez le frontend** :
   - Railway redéploiera automatiquement avec la nouvelle variable
   - OU cliquez sur **"Redeploy"** dans l'interface Railway

### Option 2 : Rebuild Local avec la Bonne URL

Si vous préférez builder localement :

1. **Créez/modifiez `.env` dans FrontEnd** :
   ```bash
   cd FrontEnd
   nano .env
   ```
   
   Ajoutez :
   ```env
   VITE_API_URL=https://votre-backend.up.railway.app/api
   ```

2. **Rebuildez** :
   ```bash
   npm run build
   ```

3. **Uploadez le nouveau `dist/` vers Railway**

---

## 🔍 Comment Trouver l'URL de votre Backend Railway

1. Allez dans votre projet Railway
2. Cliquez sur le service **Backend**
3. Allez dans **Settings** → **Networking**
4. Vous verrez l'URL (ex: `https://votre-backend.up.railway.app`)
5. L'URL complète de l'API sera : `https://votre-backend.up.railway.app/api`

---

## 📝 Vérification

Après avoir mis à jour `VITE_API_URL` et redéployé :

1. **Ouvrez la console du navigateur** (F12)
2. **Allez sur votre site frontend**
3. **Essayez de vous inscrire**
4. **Vérifiez dans l'onglet Network** que les requêtes partent vers :
   - ✅ `https://votre-backend.up.railway.app/api/register`
   - ❌ PAS `http://localhost:8000/api/register`

---

## 🚨 Points Importants

### 1. Variables d'Environnement Vite

Les variables Vite doivent commencer par `VITE_` pour être accessibles dans le code.

### 2. Rebuild Nécessaire

Après avoir changé `VITE_API_URL`, vous DEVEZ rebuilder le frontend car Vite injecte ces variables au moment du build.

### 3. Format de l'URL

- ✅ Correct : `https://votre-backend.up.railway.app/api`
- ❌ Incorrect : `https://votre-backend.up.railway.app/api/` (pas de slash final)
- ❌ Incorrect : `http://localhost:8000/api` (localhost ne fonctionne pas en production)

---

## 🔄 Processus Complet

1. **Backend Railway** :
   - Obtenez l'URL : `https://votre-backend.up.railway.app`
   - Vérifiez que l'API fonctionne : `https://votre-backend.up.railway.app/api`

2. **Frontend Railway** :
   - Ajoutez la variable : `VITE_API_URL=https://votre-backend.up.railway.app/api`
   - Redéployez

3. **Test** :
   - Ouvrez votre frontend
   - Vérifiez dans la console que les requêtes partent vers la bonne URL

---

## 🐛 Si ça ne fonctionne toujours pas

### Vérifier les Variables

Dans Railway Frontend → Settings → Variables, vérifiez que :
- ✅ `VITE_API_URL` existe
- ✅ La valeur est correcte (sans slash final)
- ✅ Le service a été redéployé après l'ajout de la variable

### Vérifier le Build

Les variables Vite sont injectées au moment du build. Si vous avez changé la variable après le build, il faut rebuilder.

### Vérifier CORS

Assurez-vous que dans votre backend Railway, la variable `FRONTEND_URL` est configurée avec l'URL de votre frontend Railway.

---

**✅ Une fois corrigé, votre frontend se connectera correctement à votre backend Railway !**
