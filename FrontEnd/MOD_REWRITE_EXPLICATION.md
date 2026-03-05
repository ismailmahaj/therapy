# 🔧 Qu'est-ce que mod_rewrite ?

## Définition

**mod_rewrite** est un module Apache qui permet de réécrire les URLs de manière dynamique. C'est essentiel pour les applications React avec React Router (Single Page Applications - SPA).

## Pourquoi c'est nécessaire ?

### Le problème sans mod_rewrite

Quand vous naviguez dans votre application React :
- Vous allez sur `https://votre-site.com/dashboard`
- Vous rafraîchissez la page (F5)
- **Apache cherche un fichier physique** `/dashboard/index.html` ou `/dashboard`
- Ce fichier n'existe pas → **Erreur 404** ❌

### La solution avec mod_rewrite

Avec mod_rewrite, Apache :
1. Reçoit la requête pour `/dashboard`
2. Vérifie si le fichier existe
3. Si le fichier n'existe pas, **redirige vers `/index.html`**
4. React Router prend le relais et affiche la bonne page ✅

## Comment ça fonctionne ?

Le fichier `.htaccess` contient ces règles :

```apache
RewriteEngine On
RewriteBase /

# Si le fichier demandé n'existe pas
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
# Redirige vers index.html
RewriteRule . /index.html [L]
```

**Explication ligne par ligne :**
- `RewriteEngine On` : Active le module de réécriture
- `RewriteBase /` : Définit le répertoire de base
- `RewriteCond %{REQUEST_FILENAME} !-f` : Si ce n'est PAS un fichier
- `RewriteCond %{REQUEST_FILENAME} !-d` : Si ce n'est PAS un répertoire
- `RewriteRule . /index.html [L]` : Redirige vers index.html (L = Last, arrête ici)

## Comment vérifier si mod_rewrite est activé ?

### Méthode 1 : Via phpinfo() (si PHP est installé)

Créez un fichier `info.php` :

```php
<?php phpinfo(); ?>
```

Accédez à `https://votre-site.com/info.php` et cherchez "mod_rewrite" dans la liste.

### Méthode 2 : Via la ligne de commande (SSH)

```bash
# Vérifier si le module est chargé
apache2ctl -M | grep rewrite

# Ou sur certains serveurs
httpd -M | grep rewrite
```

Si vous voyez `rewrite_module`, c'est activé ✅

### Méthode 3 : Tester directement

1. Créez un fichier `.htaccess` avec :
```apache
RewriteEngine On
RewriteRule ^test$ /index.html [R=302]
```

2. Accédez à `https://votre-site.com/test`
3. Si vous êtes redirigé vers `/index.html`, mod_rewrite fonctionne ✅

## Comment activer mod_rewrite ?

### Sur un serveur dédié/VPS (accès root)

#### Ubuntu/Debian :
```bash
# Activer le module
sudo a2enmod rewrite

# Redémarrer Apache
sudo systemctl restart apache2
```

#### CentOS/RHEL :
```bash
# Éditer la configuration
sudo nano /etc/httpd/conf/httpd.conf

# Chercher et décommenter (enlever le #) :
LoadModule rewrite_module modules/mod_rewrite.so

# Redémarrer Apache
sudo systemctl restart httpd
```

### Sur un hébergement mutualisé (cPanel, OVH, etc.)

**Généralement, mod_rewrite est déjà activé** sur les hébergements mutualisés modernes.

**Vérification :**
1. Connectez-vous à votre cPanel
2. Allez dans "Apache Modules" ou "Select PHP Version"
3. Vérifiez que "mod_rewrite" est activé

**Si ce n'est pas activé :**
- Contactez le support de votre hébergeur
- Ou demandez l'activation via le cPanel

## Alternatives si mod_rewrite n'est pas disponible

### Option 1 : Utiliser un autre serveur

**Nginx** (plus moderne, souvent plus rapide) :
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Voir le fichier `nginx.conf` pour la configuration complète.**

### Option 2 : Utiliser HashRouter au lieu de BrowserRouter

Dans `AppRouter.tsx`, remplacez :
```typescript
import { BrowserRouter } from 'react-router-dom';
// Par :
import { HashRouter } from 'react-router-dom';
```

**Avantages :**
- Fonctionne sans mod_rewrite
- Les URLs deviennent : `https://site.com/#/dashboard`

**Inconvénients :**
- URLs moins "propres" (avec le `#`)
- Moins bon pour le SEO

## Vérification après activation

1. **Uploadez votre `.htaccess`** dans le dossier `dist/`
2. **Testez une route** : `https://votre-site.com/dashboard`
3. **Rafraîchissez la page** (F5)
4. **Ça doit fonctionner** sans erreur 404 ✅

## Résumé

| Question | Réponse |
|----------|---------|
| **C'est quoi ?** | Module Apache pour réécrire les URLs |
| **Pourquoi ?** | Permet à React Router de fonctionner correctement |
| **Où ?** | Dans le fichier `.htaccess` |
| **Actif par défaut ?** | Souvent oui sur hébergements mutualisés |
| **Comment vérifier ?** | `apache2ctl -M \| grep rewrite` |
| **Comment activer ?** | `sudo a2enmod rewrite` (Ubuntu/Debian) |

## Support

Si vous avez des problèmes :
1. Vérifiez que mod_rewrite est activé
2. Vérifiez que `.htaccess` est dans le bon dossier
3. Vérifiez les permissions du fichier (lecture)
4. Contactez votre hébergeur si nécessaire
