<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'name' => $request->first_name . ' ' . $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'sexe' => $request->sexe, // OBLIGATOIRE
            'password' => Hash::make($request->password),
            'role' => 'user', // Compatibilité avec JWT
        ]);

        // Assigner automatiquement le rôle "client" à tous les nouveaux utilisateurs
        $clientRole = Role::where('slug', 'client')->first();
        if ($clientRole) {
            $user->roles()->attach($clientRole->id);
        }

        $user->sendEmailVerificationNotification();

        // Charger les rôles pour la réponse
        $user->load('roles');

        $token = JWTAuth::fromUser($user);

        // Préparer les données utilisateur avec les rôles
        $userData = $user->toArray();
        $userData['roles'] = $user->roles->pluck('slug')->toArray();

        return response()->json([
            'message' => 'Inscription réussie. Veuillez vérifier votre email.',
            'user' => $userData,
            'token' => $token,
        ], 201);
    }

    /**
     * Login user.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json([
                'message' => 'Identifiants invalides',
            ], 401);
        }

        $user = Auth::user();
        
        // Charger les rôles
        $user->load('roles');
        
        // Déterminer le rôle principal
        $primaryRole = $user->role;
        if ($user->roles->isNotEmpty()) {
            $primaryRole = $user->roles->first()->slug;
        }
        
        $userData = $user->toArray();
        $userData['role'] = $primaryRole;
        $userData['roles'] = $user->roles->pluck('slug')->toArray();

        if (!$user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Veuillez vérifier votre email avant de vous connecter.',
            ], 403);
        }

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => $userData,
            'token' => $token,
        ]);
    }

    /**
     * Logout user.
     */
    public function logout(): JsonResponse
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json([
            'message' => 'Déconnexion réussie',
        ]);
    }

    /**
     * Get authenticated user.
     */
    public function me(): JsonResponse
    {
        $user = Auth::user();
        
        // Charger les rôles pour déterminer le rôle principal
        $user->load('roles');
        
        // Déterminer le rôle principal basé sur les rôles many-to-many
        $primaryRole = $user->role; // Par défaut, utiliser le champ role
        
        // Si l'utilisateur a des rôles dans la table roles, utiliser le premier
        if ($user->roles->isNotEmpty()) {
            $primaryRole = $user->roles->first()->slug;
        }
        
        // Ajouter le rôle principal calculé à l'utilisateur
        $userData = $user->toArray();
        $userData['role'] = $primaryRole;
        $userData['roles'] = $user->roles->pluck('slug')->toArray();

        return response()->json([
            'user' => $userData,
        ]);
    }

    /**
     * Verify email.
     */
    public function verifyEmail(Request $request, $id = null, $hash = null): JsonResponse
    {
        // Si les paramètres sont dans l'URL (route GET avec signature)
        if ($id && $hash) {
            // Vérifier la signature si c'est une route signée
            // Le middleware 'signed' le fait automatiquement, mais on peut aussi le vérifier manuellement
            if (!$request->hasValidSignature(false)) {
                return response()->json([
                    'message' => 'Lien de vérification invalide ou expiré',
                ], 400);
            }
            
            $userId = $id;
            $userHash = $hash;
        } else {
            // Route POST sans signature (pour compatibilité)
            $request->validate([
                'id' => 'required',
                'hash' => 'required',
            ]);
            
            $userId = $request->id;
            $userHash = $request->hash;
        }

        $user = User::findOrFail($userId);

        if (!hash_equals((string) $userHash, sha1($user->getEmailForVerification()))) {
            return response()->json([
                'message' => 'Lien de vérification invalide',
            ], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email déjà vérifié',
            ]);
        }

        $user->markEmailAsVerified();

        return response()->json([
            'message' => 'Email vérifié avec succès',
        ]);
    }
}
