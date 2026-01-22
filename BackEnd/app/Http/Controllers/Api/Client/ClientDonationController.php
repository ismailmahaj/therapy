<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\CreateContributionRequest;
use App\Http\Requests\Client\CreateMultipleContributionsRequest;
use App\Models\DonationProject;
use App\Models\DonationContribution;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class ClientDonationController extends Controller
{
    /**
     * Liste des projets disponibles.
     */
    public function projects(Request $request): JsonResponse
    {
        $query = DonationProject::where('statut', 'active')
            ->with(['donationUser'])
            ->withCount(['contributions' => function ($q) {
                $q->where('statut', 'succeeded');
            }]);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('pays')) {
            $query->where('pays', $request->pays);
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $projects = $query->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($projects);
    }

    /**
     * Détail d'un projet.
     */
    public function showProject(DonationProject $project): JsonResponse
    {
        if ($project->statut !== 'active' && $project->statut !== 'completed') {
            return response()->json(['message' => 'Projet non disponible'], 404);
        }

        return response()->json([
            'project' => $project->load(['donationUser', 'contributions' => function ($q) {
                $q->where('statut', 'succeeded')->with('client');
            }])->loadCount('contributions'),
        ]);
    }

    /**
     * Faire une contribution.
     */
    public function contribute(CreateContributionRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $project = DonationProject::findOrFail($request->project_id);

            if ($project->statut !== 'active') {
                return response()->json([
                    'message' => 'Ce projet n\'accepte plus de contributions',
                ], 422);
            }

            $contribution = DonationContribution::create([
                'project_id' => $project->id,
                'client_user_id' => Auth::id(),
                'montant' => $request->montant,
                'nom_sadaqa' => $request->nom_sadaqa,
                'statut' => 'pending',
            ]);

            // Créer PaymentIntent Stripe
            Stripe::setApiKey(config('services.stripe.secret'));
            $paymentIntent = PaymentIntent::create([
                'amount' => (int) ($request->montant * 100),
                'currency' => 'eur',
                'metadata' => [
                    'contribution_id' => $contribution->id,
                    'project_id' => $project->id,
                    'user_id' => Auth::id(),
                ],
            ]);

            $contribution->update([
                'payment_intent_id' => $paymentIntent->id,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Contribution créée. Veuillez compléter le paiement.',
                'contribution' => $contribution->load('project'),
                'client_secret' => $paymentIntent->client_secret,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la création de la contribution',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Confirmer le paiement d'une contribution.
     */
    public function confirmPayment(Request $request): JsonResponse
    {
        $request->validate([
            'payment_intent_id' => ['required', 'string'],
        ]);

        DB::beginTransaction();
        try {
            $contribution = DonationContribution::where('payment_intent_id', $request->payment_intent_id)
                ->where('client_user_id', Auth::id())
                ->firstOrFail();

            Stripe::setApiKey(config('services.stripe.secret'));
            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);

            if ($paymentIntent->status === 'succeeded') {
                $contribution->update([
                    'statut' => 'succeeded',
                    'payment_method' => $paymentIntent->payment_method ?? null,
                ]);

                $contribution->project->addContribution($contribution->montant);

                DB::commit();

                return response()->json([
                    'message' => 'Paiement confirmé. Contribution enregistrée.',
                    'contribution' => $contribution->fresh()->load('project'),
                ]);
            }

            return response()->json([
                'message' => 'Le paiement n\'a pas réussi',
            ], 400);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la confirmation du paiement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Faire plusieurs contributions en une fois (multi-dons).
     */
    public function contributeMultiple(CreateMultipleContributionsRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $contributions = [];
            $totalAmount = 0;
            $contributionIds = [];

            // Valider et créer chaque contribution
            foreach ($request->contributions as $contributionData) {
                $project = DonationProject::findOrFail($contributionData['project_id']);

                if ($project->statut !== 'active') {
                    DB::rollBack();
                    return response()->json([
                        'message' => sprintf('Le projet "%s" n\'accepte plus de contributions', $project->nom),
                        'project_id' => $project->id,
                    ], 422);
                }

                $contribution = DonationContribution::create([
                    'project_id' => $project->id,
                    'client_user_id' => Auth::id(),
                    'montant' => $contributionData['montant'],
                    'nom_sadaqa' => $contributionData['nom_sadaqa'] ?? null,
                    'statut' => 'pending',
                ]);

                $contributions[] = $contribution;
                $contributionIds[] = $contribution->id;
                $totalAmount += $contribution->montant;
            }

            // Créer un seul PaymentIntent pour toutes les contributions
            Stripe::setApiKey(config('services.stripe.secret'));
            $paymentIntent = PaymentIntent::create([
                'amount' => (int) ($totalAmount * 100),
                'currency' => 'eur',
                'metadata' => [
                    'contribution_ids' => implode(',', $contributionIds),
                    'user_id' => Auth::id(),
                    'count' => count($contributions),
                ],
            ]);

            // Mettre à jour toutes les contributions avec le même payment_intent_id
            foreach ($contributions as $contribution) {
                $contribution->update([
                    'payment_intent_id' => $paymentIntent->id,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => sprintf(
                    '%d contribution(s) créée(s). Veuillez compléter le paiement.',
                    count($contributions)
                ),
                'contributions' => DonationContribution::whereIn('id', $contributionIds)
                    ->with('project.donationUser')
                    ->get(),
                'client_secret' => $paymentIntent->client_secret,
                'total_amount' => $totalAmount,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la création des contributions',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Confirmer le paiement de plusieurs contributions.
     */
    public function confirmMultiplePayments(Request $request): JsonResponse
    {
        $request->validate([
            'payment_intent_id' => ['required', 'string'],
        ]);

        DB::beginTransaction();
        try {
            // Récupérer toutes les contributions liées à ce payment_intent_id
            $contributions = DonationContribution::where('payment_intent_id', $request->payment_intent_id)
                ->where('client_user_id', Auth::id())
                ->get();

            if ($contributions->isEmpty()) {
                return response()->json([
                    'message' => 'Aucune contribution trouvée pour ce paiement',
                ], 404);
            }

            Stripe::setApiKey(config('services.stripe.secret'));
            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);

            if ($paymentIntent->status === 'succeeded') {
                // Confirmer toutes les contributions
                foreach ($contributions as $contribution) {
                    $contribution->update([
                        'statut' => 'succeeded',
                        'payment_method' => $paymentIntent->payment_method ?? null,
                    ]);

                    $contribution->project->addContribution($contribution->montant);
                }

                DB::commit();

                $confirmedContributions = DonationContribution::whereIn('id', $contributions->pluck('id'))
                    ->with('project.donationUser')
                    ->get();

                return response()->json([
                    'message' => sprintf(
                        'Paiement confirmé. %d contribution(s) enregistrée(s).',
                        $confirmedContributions->count()
                    ),
                    'contributions' => $confirmedContributions,
                ]);
            }

            return response()->json([
                'message' => 'Le paiement n\'a pas réussi',
            ], 400);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la confirmation du paiement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mes contributions.
     */
    public function myContributions(Request $request): JsonResponse
    {
        $query = DonationContribution::where('client_user_id', Auth::id())
            ->with(['project.donationUser'])
            ->orderBy('created_at', 'desc');

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        $contributions = $query->paginate(20);

        return response()->json($contributions);
    }
}
