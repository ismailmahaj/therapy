<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Donation\StoreDonationRequest;
use App\Models\Donation;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class DonationController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Display a listing of donations for the authenticated user.
     */
    public function index(): JsonResponse
    {
        $donations = Donation::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'donations' => $donations,
        ]);
    }

    /**
     * Store a newly created donation.
     */
    public function store(StoreDonationRequest $request): JsonResponse
    {
        $donation = Donation::create([
            'user_id' => Auth::id(),
            'type' => $request->type,
            'amount' => $request->amount,
            'sadaqa_name' => $request->sadaqa_name,
            'status' => 'pending',
        ]);

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => (int) ($request->amount * 100), // Convert to cents
                'currency' => 'eur',
                'metadata' => [
                    'donation_id' => $donation->id,
                    'user_id' => Auth::id(),
                    'type' => $request->type,
                ],
            ]);

            $donation->update([
                'payment_intent_id' => $paymentIntent->id,
                'stripe_response' => $paymentIntent->toArray(),
            ]);

            return response()->json([
                'message' => 'Donation créée avec succès',
                'donation' => $donation,
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du paiement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified donation.
     */
    public function show(Donation $donation): JsonResponse
    {
        if ($donation->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json([
                'message' => 'Non autorisé',
            ], 403);
        }

        return response()->json([
            'donation' => $donation,
        ]);
    }
}
