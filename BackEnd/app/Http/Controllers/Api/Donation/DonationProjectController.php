<?php

namespace App\Http\Controllers\Api\Donation;

use App\Http\Controllers\Controller;
use App\Http\Requests\Donation\CreateProjectRequest;
use App\Models\DonationProject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DonationProjectController extends Controller
{
    /**
     * Liste des projets.
     */
    public function index(Request $request): JsonResponse
    {
        $query = DonationProject::query();

        // Si role donation : mes projets
        if (Auth::user()->isDonationUser() && !Auth::user()->isAdmin()) {
            $query->where('donation_user_id', Auth::id());
        }

        // Filtres
        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('pays')) {
            $query->where('pays', $request->pays);
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $projects = $query->with(['donationUser', 'contributions' => function ($q) {
            $q->where('statut', 'succeeded');
        }])
        ->withCount('contributions')
        ->orderBy('is_featured', 'desc')
        ->orderBy('created_at', 'desc')
        ->paginate(20);

        return response()->json($projects);
    }

    /**
     * Créer un projet.
     */
    public function store(CreateProjectRequest $request): JsonResponse
    {
        $project = DonationProject::create([
            'donation_user_id' => Auth::id(),
            ...$request->validated(),
            'montant_collecte' => 0,
            'progress_percentage' => 0,
            'statut' => 'draft',
        ]);

        return response()->json([
            'message' => 'Projet créé avec succès',
            'project' => $project,
        ], 201);
    }

    /**
     * Détail d'un projet.
     */
    public function show(DonationProject $project): JsonResponse
    {
        $this->authorize('view', $project);

        return response()->json([
            'project' => $project->load(['donationUser', 'contributions.client'])->loadCount('contributions'),
        ]);
    }

    /**
     * Modifier un projet.
     */
    public function update(CreateProjectRequest $request, DonationProject $project): JsonResponse
    {
        $this->authorize('update', $project);

        $project->update($request->validated());

        return response()->json([
            'message' => 'Projet mis à jour avec succès',
            'project' => $project->fresh(),
        ]);
    }

    /**
     * Activer un projet.
     */
    public function activate(DonationProject $project): JsonResponse
    {
        $this->authorize('update', $project);

        $project->update([
            'statut' => 'active',
            'start_date' => $project->start_date ?? now()->toDateString(),
        ]);

        return response()->json([
            'message' => 'Projet activé',
            'project' => $project->fresh(),
        ]);
    }

    /**
     * Supprimer un projet.
     */
    public function destroy(DonationProject $project): JsonResponse
    {
        $this->authorize('delete', $project);

        $project->delete();

        return response()->json([
            'message' => 'Projet supprimé avec succès',
        ]);
    }
}
