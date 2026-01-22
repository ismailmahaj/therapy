<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserProfileController extends Controller
{
    /**
     * Obtenir le profil de l'utilisateur connecté.
     */
    public function show(): JsonResponse
    {
        $user = Auth::user();
        $user->load('roles');

        $userData = $user->toArray();
        $userData['roles'] = $user->roles->pluck('slug')->toArray();

        return response()->json([
            'user' => $userData,
        ]);
    }

    /**
     * Mettre à jour le profil de l'utilisateur connecté.
     */
    public function update(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'email' => ['sometimes', 'required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'sexe' => ['sometimes', 'required', 'in:homme,femme'],
            'avatar' => ['nullable', 'string', 'max:500'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'current_password' => ['required_with:password', 'string'],
        ]);

        // Vérifier le mot de passe actuel si changement de mot de passe
        if (isset($validated['password'])) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'message' => 'Le mot de passe actuel est incorrect.',
                ], 422);
            }
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // Supprimer current_password car il n'est pas dans la table
        unset($validated['current_password']);

        // Mettre à jour le nom complet si prénom ou nom changé
        if (isset($validated['first_name']) || isset($validated['last_name'])) {
            $first_name = $validated['first_name'] ?? $user->first_name;
            $last_name = $validated['last_name'] ?? $user->last_name;
            $validated['name'] = $first_name . ' ' . $last_name;
        }

        // Si l'email change, réinitialiser la vérification
        if (isset($validated['email']) && $validated['email'] !== $user->email) {
            $validated['email_verified_at'] = null;
        }

        $user->update($validated);
        $user->load('roles');

        $userData = $user->toArray();
        $userData['roles'] = $user->roles->pluck('slug')->toArray();

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user' => $userData,
        ]);
    }
}
