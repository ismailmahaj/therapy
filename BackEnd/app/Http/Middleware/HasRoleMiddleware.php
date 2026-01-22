<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HasRoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!auth()->check()) {
            return response()->json([
                'message' => 'Non authentifié',
            ], 401);
        }

        $user = auth()->user();
        
        // Charger les rôles si pas déjà chargés
        if (!$user->relationLoaded('roles')) {
            $user->load('roles');
        }

        // Vérifier via les rôles many-to-many (priorité)
        if ($user->hasAnyRole($roles)) {
            return $next($request);
        }

        // Compatibilité avec l'ancien système (champ role simple)
        // Mapper les rôles pour compatibilité
        $roleMapping = [
            'user' => 'client', // Les utilisateurs avec role='user' sont considérés comme clients
        ];
        $mappedRole = $roleMapping[$user->role] ?? $user->role;
        
        if (in_array($mappedRole, $roles)) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Accès non autorisé. Rôle requis : ' . implode(', ', $roles),
        ], 403);
    }
}
