# 🚀 Guide de Déploiement - Frontend

## Problème des erreurs 404

Si vous rencontrez des erreurs 404 lors du déploiement, c'est généralement dû à :
1. **Chemin de base incorrect** : Les fichiers sont cherchés au mauvais endroit
2. **Routing côté serveur** : Le serveur ne redirige pas les routes vers `index.html`
3. **Configuration du serveur** : Le serveur ne sert pas correctement les fichiers statiques

## Solutions selon votre serveur

### 1. Apache (.htaccess)

**Étape 1 :** Copiez le fichier `.htaccess` dans le dossier `dist/` après le build :

```bash
cp .htaccess dist/
```

**Étape 2 :** Assurez-vous que `mod_rewrite` est activé sur votre serveur Apache.

**Étape 3 :** Vérifiez que votre configuration Apache permet les fichiers `.htaccess` :

```apache
<Directory "/var/www/html">
    AllowOverride All
</Directory>
```

### 2. Nginx

**Étape 1 :** Copiez la configuration `nginx.conf` dans votre configuration Nginx :

```bash
sudo cp nginx.conf /etc/nginx/sites-available/votre-site
sudo ln -s /etc/nginx/sites-available/votre-site /etc/nginx/sites-enabled/
```

**Étape 2 :** Modifiez le chemin `root` et `server_name` selon votre configuration.

**Étape 3 :** Testez et rechargez Nginx :

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Netlify

**Étape 1 :** Le fichier `public/_redirects` sera automatiquement copié dans `dist/` lors du build.

**Étape 2 :** Configurez le build dans `netlify.toml` :

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4. Vercel

**Étape 1 :** Créez un fichier `vercel.json` :

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 5. GitHub Pages / Sous-dossier

Si votre app est déployée dans un sous-dossier (ex: `https://username.github.io/repo/`), modifiez `vite.config.ts` :

```typescript
export default defineConfig({
  base: '/nom-du-repo/', // Changez selon votre repo
  // ...
})
```

Puis rebuildez :

```bash
npm run build
```

## Checklist de déploiement

- [ ] **Build réussi** : `npm run build` s'exécute sans erreur
- [ ] **Fichiers générés** : Le dossier `dist/` contient tous les fichiers
- [ ] **Configuration serveur** : Fichier de configuration (`.htaccess`, `nginx.conf`, etc.) en place
- [ ] **Base path** : `base` dans `vite.config.ts` correspond au chemin de déploiement
- [ ] **Routing** : Toutes les routes redirigent vers `index.html`
- [ ] **Assets** : Les fichiers JS/CSS sont accessibles (pas de 404)

## Vérification après déploiement

1. **Ouvrez la console du navigateur** (F12)
2. **Vérifiez l'onglet Network** :
   - Les fichiers JS/CSS doivent charger avec un statut 200
   - Pas d'erreurs 404
3. **Testez le routing** :
   - Naviguez vers différentes pages
   - Rafraîchissez la page (F5)
   - Tout doit fonctionner sans erreur 404

## Dépannage

### Erreur : "Failed to load resource: 404"

**Solution :**
1. Vérifiez que le `base` dans `vite.config.ts` correspond à votre chemin de déploiement
2. Vérifiez que les fichiers sont bien dans le dossier `dist/`
3. Vérifiez les permissions du serveur (lecture des fichiers)

### Erreur : "Cannot GET /route"

**Solution :**
1. Vérifiez que le fichier de configuration du serveur (`.htaccess`, `nginx.conf`, etc.) est en place
2. Vérifiez que le serveur redirige bien vers `index.html`

### Les assets ne se chargent pas

**Solution :**
1. Vérifiez le chemin dans `index.html` (doit être relatif : `./assets/...`)
2. Vérifiez que le dossier `dist/assets/` contient les fichiers
3. Vérifiez les permissions du serveur

## Commandes utiles

```bash
# Build pour production
npm run build

# Vérifier le contenu de dist/
ls -la dist/

# Tester localement le build
npm run preview

# Vérifier la taille des chunks
du -sh dist/assets/*
```

## Support

Si les problèmes persistent :
1. Vérifiez les logs du serveur
2. Vérifiez la console du navigateur (F12)
3. Vérifiez que tous les fichiers sont bien uploadés sur le serveur
