# 🔑 Configuration des Comptes - Therapy Center

## ❌ Problème : "Identifiants invalides"

Si vous voyez "Identifiants invalides", c'est que le seeder n'a pas encore été exécuté.

## ✅ Solution : Exécuter le Seeder

### Étape 1 : Exécuter le seeder

```bash
cd BackEnd
php artisan db:seed
```

Cela va créer les comptes suivants :

### Comptes créés

#### 1. Admin
- **Email:** `admin@therapycenter.com`
- **Mot de passe:** `password`
- **Rôle:** `admin`

#### 2. SuperAdmin
- **Email:** `superadmin@therapycenter.com`
- **Mot de passe:** `password`
- **Rôle:** `superadmin`

#### 3. User (utilisateur test)
- **Email:** `user@therapycenter.com`
- **Mot de passe:** `password`
- **Rôle:** `user`

## 🔍 Vérifier que les comptes existent

### Méthode 1 : Via Tinker

```bash
cd BackEnd
php artisan tinker
```

Puis dans Tinker :
```php
$users = App\Models\User::all(['email', 'role', 'email_verified_at']);
foreach($users as $user) {
    echo $user->email . ' - ' . $user->role . ' - ' . ($user->email_verified_at ? 'Vérifié' : 'Non vérifié') . PHP_EOL;
}
exit
```

### Méthode 2 : Vérifier dans la base de données

```bash
cd BackEnd
php artisan db:show
```

Puis connectez-vous à MySQL et exécutez :
```sql
SELECT email, role, email_verified_at FROM users;
```

## 🔄 Réinitialiser et recréer les comptes

Si vous voulez réinitialiser complètement :

```bash
cd BackEnd

# Option 1 : Réinitialiser uniquement les users (si la table existe déjà)
php artisan tinker
```

Puis dans Tinker :
```php
App\Models\User::truncate();
exit
```

Ensuite :
```bash
php artisan db:seed
```

### Option 2 : Réinitialiser toute la base de données

⚠️ **ATTENTION : Cela supprime toutes les données !**

```bash
cd BackEnd
php artisan migrate:fresh --seed
```

## ✅ Après exécution du seeder

1. **Allez sur** : `http://localhost:5173/login`
2. **Connectez-vous avec** :
   - Email : `admin@therapycenter.com`
   - Mot de passe : `password`

Vous devriez maintenant pouvoir vous connecter !

## 🎯 Accès aux fonctionnalités Admin

Une fois connecté en tant qu'admin, vous aurez accès à :

- **Dashboard** : `/dashboard`
- **Gestion des créneaux** : `/admin/availability-slots`
- **Tous les rendez-vous** : Via API `/api/admin/appointments`
- **Tous les utilisateurs** : Via API `/api/admin/users`
- **Toutes les donations** : Via API `/api/admin/donations`

## 🔐 Notes importantes

- Les mots de passe sont hachés avec bcrypt
- Les emails sont déjà vérifiés (`email_verified_at` est défini)
- Vous pouvez changer les mots de passe si nécessaire via Tinker

## 🛠️ Changer un mot de passe

```bash
php artisan tinker
```

```php
$user = App\Models\User::where('email', 'admin@therapycenter.com')->first();
$user->password = Hash::make('nouveau_mot_de_passe');
$user->save();
exit
```

---

**Résumé rapide :**
```bash
cd BackEnd
php artisan db:seed
```

Puis connectez-vous avec `admin@therapycenter.com` / `password`
