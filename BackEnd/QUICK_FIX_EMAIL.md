# 🚀 Solution Rapide : Vérifier l'Email

## ❌ Problème
Vous voyez le message : **"Veuillez vérifier votre email avant de vous connecter"**

## ✅ Solutions Rapides

### Solution 1 : Vérifier via la Commande Artisan (LE PLUS RAPIDE)

```bash
cd BackEnd
php artisan user:verify-email votre@email.com
```

Remplacez `votre@email.com` par l'email que vous avez utilisé lors de l'inscription.

**Exemple :**
```bash
php artisan user:verify-email user@therapycenter.com
```

✅ Après cette commande, vous pourrez vous connecter normalement !

---

### Solution 2 : Vérifier via Tinker (Alternative)

```bash
cd BackEnd
php artisan tinker
```

Puis dans Tinker :
```php
$user = App\Models\User::where('email', 'votre@email.com')->first();
$user->markEmailAsVerified();
$user->save();
exit
```

---

### Solution 3 : Vérifier via la Page Frontend

1. **Allez sur** : `http://localhost:5173/verify-email`
2. Si vous avez reçu l'email, **cliquez sur le lien** dans l'email
3. Ou **copiez l'URL** depuis l'email et collez-la dans le navigateur

L'URL ressemble à :
```
http://localhost:5173/verify-email?id=1&hash=abc123...&signature=xyz...
```

---

### Solution 4 : Vérifier l'Email Reçu

1. **Vérifiez votre boîte email** (y compris spam/courrier indésirable)
2. **Cherchez un email** de "Therapy Center" ou "Verify Email"
3. **Cliquez sur le lien** dans l'email

---

## 🔧 Si vous ne recevez pas l'email

### Configurer l'envoi d'emails en développement

#### Option A : Utiliser les logs (pas besoin de configurer SMTP)

Dans `.env` :
```env
MAIL_MAILER=log
```

Les emails seront écrits dans `storage/logs/laravel.log`

#### Option B : Utiliser Mailtrap (pour voir les emails)

1. Créez un compte gratuit sur [Mailtrap.io](https://mailtrap.io)
2. Configurez dans `.env` :

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=votre_username
MAIL_PASSWORD=votre_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@therapycenter.com"
MAIL_FROM_NAME="Therapy Center"
```

---

## ✅ Après vérification

Une fois l'email vérifié (via n'importe quelle méthode ci-dessus), vous pouvez vous connecter :

1. **Allez sur** : `http://localhost:5173/login`
2. **Entrez** votre email et mot de passe
3. **Cliquez sur** "Se connecter"

✅ La connexion fonctionnera maintenant !

---

## 🎯 Résumé - La Solution la Plus Rapide

```bash
cd BackEnd
php artisan user:verify-email votre@email.com
```

C'est tout ! Après cette commande, reconnectez-vous. 🚀
