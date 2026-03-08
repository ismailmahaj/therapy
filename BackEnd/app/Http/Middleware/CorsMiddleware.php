<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Gérer les requêtes OPTIONS (preflight)
        if ($request->getMethod() === 'OPTIONS') {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $this->getAllowedOrigin($request))
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Max-Age', '86400');
        }

        $response = $next($request);

        // Ajouter les headers CORS à la réponse
        $origin = $this->getAllowedOrigin($request);
        
        return $response
            ->header('Access-Control-Allow-Origin', $origin)
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
            ->header('Access-Control-Allow-Credentials', 'true');
    }

    /**
     * Déterminer l'origine autorisée
     */
    private function getAllowedOrigin(Request $request): string
    {
        $origin = $request->headers->get('Origin');
        
        // Autoriser toutes les URLs Railway
        if ($origin && preg_match('#^https://.*\.up\.railway\.app$#', $origin)) {
            return $origin;
        }
        
        // Autoriser FRONTEND_URL si configurée
        $frontendUrl = env('FRONTEND_URL');
        if ($frontendUrl && $origin === $frontendUrl) {
            return $origin;
        }
        
        // Autoriser APP_URL si configurée
        $appUrl = env('APP_URL');
        if ($appUrl && $origin === $appUrl) {
            return $origin;
        }
        
        // En développement, autoriser localhost
        if (env('APP_ENV') !== 'production') {
            if ($origin && (str_contains($origin, 'localhost') || str_contains($origin, '127.0.0.1'))) {
                return $origin;
            }
        }
        
        // Par défaut, retourner l'origine de la requête si elle est Railway
        return $origin && preg_match('#^https://.*\.up\.railway\.app$#', $origin) ? $origin : '*';
    }
}
