# 🔍 Débogage erreur 422 - Validation échouée

## ❌ Erreur actuelle

```
POST /api/therapy/slots 422 (Unprocessable Content)
```

**Signification** : La validation des données a échoué. Les données envoyées ne respectent pas les règles de validation.

## 📋 Champs requis pour créer un créneau

Selon `CreateSlotRequest`, voici les champs **obligatoires** :

### Champs obligatoires

1. **`date`** (string, format: YYYY-MM-DD)
   - Doit être une date valide
   - Doit être aujourd'hui ou une date future

2. **`start_time`** (string, format: HH:mm)
   - Exemple : `"14:30"` (pas `"14:30:00"`)

3. **`end_time`** (string, format: HH:mm)
   - Doit être après `start_time`
   - Exemple : `"16:30"`

4. **`max_clients`** (integer)
   - Minimum : 1
   - Maximum : 10

5. **`hijama_type`** (string)
   - Valeurs acceptées : `hijama_seche`, `hijama_humide`, `hijama_sunnah`, `hijama_esthetique`, `autres`

### Champs optionnels

- `duration_minutes` (integer, 15-480)
- `location` (string, max 255)
- `price` (numeric, min 0)
- `notes` (string)

## 🔍 Comment identifier le problème

### 1. Vérifier la console du navigateur

Ouvrez la console (F12) et regardez la réponse de l'erreur 422. Vous devriez voir quelque chose comme :

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "hijama_type": ["Le type de hijama est obligatoire."],
    "date": ["La date est obligatoire."]
  }
}
```

### 2. Vérifier les données envoyées

Dans la console, cherchez la requête POST vers `/api/therapy/slots` et vérifiez le **Payload** ou **Request Payload**.

### 3. Erreurs courantes

#### ❌ Format de date incorrect
```json
{ "date": "2026-03-08T14:30:00Z" }  // ❌ Mauvais format
```
```json
{ "date": "2026-03-08" }  // ✅ Bon format
```

#### ❌ Format d'heure incorrect
```json
{ "start_time": "14:30:00" }  // ❌ Mauvais format (avec secondes)
```
```json
{ "start_time": "14:30" }  // ✅ Bon format
```

#### ❌ Type de hijama manquant ou invalide
```json
{ "hijama_type": "" }  // ❌ Vide
{ "hijama_type": "hijama" }  // ❌ Valeur invalide
```
```json
{ "hijama_type": "hijama_seche" }  // ✅ Bon
```

#### ❌ max_clients manquant ou invalide
```json
{ "max_clients": 0 }  // ❌ Trop petit
{ "max_clients": 11 }  // ❌ Trop grand
```
```json
{ "max_clients": 5 }  // ✅ Bon
```

## ✅ Exemple de données correctes

```json
{
  "date": "2026-03-10",
  "start_time": "14:30",
  "end_time": "16:30",
  "max_clients": 5,
  "hijama_type": "hijama_seche",
  "location": "Cabinet médical",
  "price": 50.00,
  "notes": "Premier créneau de la journée"
}
```

## 🔧 Vérifications dans le frontend

Vérifiez que le frontend envoie bien :

1. **Date au bon format** : `YYYY-MM-DD` (pas de timestamp)
2. **Heures au format HH:mm** : `14:30` (pas `14:30:00`)
3. **hijama_type présent** et avec une valeur valide
4. **max_clients** est un nombre entre 1 et 10

## 📝 Messages de validation améliorés

J'ai amélioré les messages de validation dans `CreateSlotRequest` pour qu'ils soient plus explicites. Après redéploiement, vous verrez des messages plus clairs dans la réponse d'erreur.

---

**Vérifiez la console du navigateur pour voir les erreurs de validation détaillées ! 🔍**
