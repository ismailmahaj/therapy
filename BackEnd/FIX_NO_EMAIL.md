# 🔧 Solution : Je ne reçois aucun email de vérification

## ❌ Problème
Aucun email de vérification n'est reçu après l'inscription.

## ✅ Solution Rapide (Développement Local)

### Option 1 : Voir les emails dans les logs (LE PLUS SIMPLE)

Ajoutez dans votre fichier `.env` du dossier `BackEnd` :

```env
MAIL_MAILER=log
```

Puis **relancez le serveur** :
```bash
cd BackEnd
php artisan config:clear
php artisan serve
```

**Les emails seront écrits dans** : `storage/logs/laravel.log`

Pour voir les emails en temps réel :
```bash
tail -f storage/logs/laravel.log | grep -A 50 "Verification"
```

### Option 2 : Vérifier directement sans email (RECOMMANDÉ pour tests)

**Utilisez la commande Artisan** pour vérifier manuellement :

```bash
cd BackEnd
php artisan user:verify-email votre@email.com
```

Remplacez `votre@email.com` par l'email que vous avez utilisé lors de l'inscription.

**Exemple :**
```bash
php artisan user:verify-email user@therapycenter.com
```

✅ **Après cette commande, vous pouvez vous connecter immédiatement !**

---

## 📧 Configuration pour recevoir de vrais emails

### Option 1 : Mailtrap (Gratuit, pour développement)

1. **Créez un compte gratuit** sur [Mailtrap.io](https://mailtrap.io)
2. **Copiez vos identifiants** SMTP depuis Mailtrap
3. **Ajoutez dans `.env`** :

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=votre_username_mailtrap
MAIL_PASSWORD=votre_password_mailtrap
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@therapycenter.com"
MAIL_FROM_NAME="Therapy Center"
```

4. **Videz le cache** :
```bash
php artisan config:clear
```

Les emails apparaîtront dans votre boîte Mailtrap au lieu d'être envoyés.

### Option 2 : Gmail SMTP (Pour tests réels)

⚠️ **Vous devez générer un "App Password" dans Google**

1. **Activez la validation en 2 étapes** sur votre compte Google
2. **Générez un "App Password"** : [Google App Passwords](https://myaccount.google.com/apppasswords)
3. **Ajoutez dans `.env`** :

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre_email@gmail.com
MAIL_PASSWORD=votre_app_password_google
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="votre_email@gmail.com"
MAIL_FROM_NAME="Therapy Center"
```

### Option 3 : Configuration SMTP personnalisée

```env
MAIL_MAILER=smtp
MAIL_HOST=votre_smtp_host
MAIL_PORT=587
MAIL_USERNAME=votre_username
MAIL_PASSWORD=votre_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@votre-domaine.com"
MAIL_FROM_NAME="Therapy Center"
```

---

## 🔍 Vérifier si les emails sont envoyés

### Vérifier les logs Laravel

```bash
cd BackEnd
tail -100 storage/logs/laravel.log | grep -i "mail\|email\|verification"
```

### Vérifier dans la base de données

```bash
php artisan tinker
```

Puis :
```php
// Vérifier si un utilisateur existe
$user = App\Models\User::where('email', 'votre@email.com')->first();
if ($user) {
    echo "Utilisateur trouvé : " . $user->email . "\n";
    echo "Email vérifié : " . ($user->hasVerifiedEmail() ? 'Oui' : 'Non') . "\n";
    echo "Email vérifié à : " . ($user->email_verified_at ?? 'Pas encore') . "\n";
} else {
    echo "Utilisateur non trouvé\n";
}
exit
```

### Test d'envoi d'email

```bash
php artisan tinker
```

Puis :
```php
use Illuminate\Support\Facades\Mail;
Mail::raw('Test email', function ($message) {
    $message->to('votre@email.com')
            ->subject('Test Email');
});
exit
```

---

## ✅ Solution Immédiate (Recommandée)

**Pour continuer à développer sans attendre l'email :**

1. **Vérifiez manuellement l'email** :
```bash
cd BackEnd
php artisan user:verify-email votre@email.com
```

2. **Connectez-vous** normalement sur `http://localhost:5173/login`

3. **Configurez les emails plus tard** si nécessaire

---

## 📝 Configuration Complète du `.env`

Votre fichier `.env` devrait contenir au minimum :

```env
# ... autres configurations ...

# Mail Configuration (Option 1 : Log pour développement)
MAIL_MAILER=log

# OU (Option 2 : SMTP pour recevoir de vrais emails)
# MAIL_MAILER=smtp
# MAIL_HOST=smtp.mailtrap.io
# MAIL_PORT=2525
# MAIL_USERNAME=votre_username
# MAIL_PASSWORD=votre_password
# MAIL_ENCRYPTION=tls

MAIL_FROM_ADDRESS="noreply@therapycenter.com"
MAIL_FROM_NAME="Therapy Center"
```

---

## 🎯 Résumé - Solution la Plus Rapide

**Pour continuer maintenant :**
```bash
cd BackEnd
php artisan user:verify-email votre@email.com
```

**Pour voir les emails plus tard :**
Ajoutez dans `.env` :
```env
MAIL_MAILER=log
```
Puis vérifiez `storage/logs/laravel.log`
