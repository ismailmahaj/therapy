<?php

namespace App\Http\Controllers\Api\Therapy;

use App\Http\Controllers\Controller;
use App\Models\TherapistProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TherapistProfileController extends Controller
{
    /**
     * Obtenir ou créer le profil thérapeute.
     */
    public function show(): JsonResponse
    {
        $user = Auth::user();

        if (!$user->isTherapyUser()) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à accéder à cette ressource.',
            ], 403);
        }

        $profile = $user->therapistProfile;

        if (!$profile) {
            return response()->json([
                'message' => 'Profil thérapeute non trouvé. Veuillez le créer.',
                'profile' => null,
            ]);
        }

        return response()->json([
            'profile' => $profile,
        ]);
    }

    /**
     * Créer ou mettre à jour le profil thérapeute.
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user->isTherapyUser()) {
            return response()->json([
                'message' => 'Vous n\'êtes pas autorisé à accéder à cette ressource.',
            ], 403);
        }

        $validated = $request->validate([
            'sexe' => ['required', 'in:homme,femme'],
            'hijama_types' => ['required', 'array', 'min:1'],
            'hijama_types.*' => ['required', 'string', 'max:100'], // Permet des types personnalisés
            'pratiques_personnalisees' => ['nullable', 'array'],
            'pratiques_personnalisees.*' => ['string', 'max:100'],
            'autres_types' => ['nullable', 'string', 'max:1000'], // Augmenté pour plus de flexibilité
        ]);

        DB::beginTransaction();
        try {
            // Mettre à jour le sexe de l'utilisateur si différent
            if ($user->sexe !== $validated['sexe']) {
                $user->update(['sexe' => $validated['sexe']]);
            }

            // Fusionner les types prédéfinis et les pratiques personnalisées
            $allHijamaTypes = $validated['hijama_types'];
            if (!empty($validated['pratiques_personnalisees'])) {
                $allHijamaTypes = array_merge($allHijamaTypes, $validated['pratiques_personnalisees']);
            }
            
            // Créer ou mettre à jour le profil
            $profile = TherapistProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'sexe' => $validated['sexe'],
                    'hijama_types' => array_unique($allHijamaTypes), // Éviter les doublons
                    'autres_types' => $validated['autres_types'] ?? null,
                ]
            );

            DB::commit();

            return response()->json([
                'message' => 'Profil thérapeute enregistré avec succès.',
                'profile' => $profile,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de l\'enregistrement du profil.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mettre à jour le profil thérapeute.
     */
    public function update(Request $request): JsonResponse
    {
        return $this->store($request);
    }
}
