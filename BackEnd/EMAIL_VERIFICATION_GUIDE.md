# 📧 Guide : Vérification d'Email

## Où vérifier votre email ?

### Méthode 1 : Via l'email reçu (Recommandé)

1. **Vérifiez votre boîte email** (y compris le dossier spam)
2. **Cherchez un email de "Therapy Center"** ou "Verify Email"
3. **Cliquez sur le lien de vérification** dans l'email
4. Le lien vous redirigera vers : `http://localhost:5173/verify-email?id=...&hash=...&signature=...`
5. La vérification se fait automatiquement

### Méthode 2 : Via la page frontend

1. **Allez sur** : `http://localhost:5173/verify-email`
2. Si vous avez reçu l'email, **copiez les paramètres `id` et `hash`** depuis l'URL du lien
3. **Ajoutez-les manuellement** à l'URL : `/verify-email?id=...&hash=...`

### Méthode 3 : En développement (si email non configuré)

Si vous n'avez pas configuré l'envoi d'emails, vous pouvez :

#### Option A : Vérifier directement via l'API

```bash
# Remplacez {id} et {hash} par les valeurs de l'utilisateur
curl -X POST http://localhost:8000/api/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "id": "1",
    "hash": "hash_generé"
  }'
```

#### Option B : Vérifier via Tinker (Laravel)

```bash
cd BackEnd
php artisan tinker
```

Puis dans Tinker :
```php
$user = App\Models\User::find(1); // Remplacez 1 par l'ID de l'utilisateur
$user->markEmailAsVerified();
$user->save();
```

#### Option C : Désactiver temporairement la vérification (DÉVELOPPEMENT UNIQUEMENT)

Pour tester sans vérification email, modifiez temporairement `AuthController.php` :

```php
// Dans la méthode login(), commentez cette vérification :
/*
if (!$user->hasVerifiedEmail()) {
    return response()->json([
        'message' => 'Veuillez vérifier votre email avant de vous connecter.',
    ], 403);
}
*/
```

⚠️ **N'oubliez pas de remettre cette vérification en production !**

## 📧 Configuration de l'envoi d'emails

### Pour recevoir les emails en développement

#### Option 1 : Mailtrap (Recommandé pour développement)

1. Créez un compte sur [Mailtrap.io](https://mailtrap.io)
2. Configurez dans `.env` :

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=votre_username_mailtrap
MAIL_PASSWORD=votre_password_mailtrap
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@therapycenter.com"
MAIL_FROM_NAME="${APP_NAME}"
```

#### Option 2 : Log des emails (Développement local)

Pour voir les emails dans les logs Laravel au lieu de les envoyer :

```env
MAIL_MAILER=log
```

Les emails seront écrits dans `storage/logs/laravel.log`

#### Option 3 : SMTP Gmail (Pour tests)

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre_email@gmail.com
MAIL_PASSWORD=votre_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="votre_email@gmail.com"
MAIL_FROM_NAME="${APP_NAME}"
```

⚠️ Pour Gmail, vous devez générer un "App Password" dans les paramètres Google.

## 🔍 Vérifier que l'email a bien été envoyé

### Vérifier les logs Laravel

```bash
tail -f BackEnd/storage/logs/laravel.log
```

### Vérifier dans la base de données

```bash
cd BackEnd
php artisan tinker
```

```php
$user = App\Models\User::where('email', 'votre@email.com')->first();
echo "Email vérifié : " . ($user->hasVerifiedEmail() ? 'Oui' : 'Non');
echo "\nEmail vérifié à : " . $user->email_verified_at;
```

## ✅ Après vérification

Une fois votre email vérifié, vous pouvez vous connecter normalement avec :

- Email : votre email
- Mot de passe : votre mot de passe

L'erreur "Veuillez vérifier votre email avant de vous connecter" disparaîtra.
