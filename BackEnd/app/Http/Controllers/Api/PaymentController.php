<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\ConfirmPaymentRequest;
use App\Http\Requests\Payment\CreatePaymentIntentRequest;
use App\Models\Appointment;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a payment intent for an appointment deposit.
     */
    public function createPaymentIntent(CreatePaymentIntentRequest $request): JsonResponse
    {
        $appointment = Appointment::where('id', $request->appointment_id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        if ($appointment->status === 'confirmed') {
            return response()->json([
                'message' => 'Ce rendez-vous est déjà confirmé',
            ], 400);
        }

        if ($appointment->payment && $appointment->payment->status === 'succeeded') {
            return response()->json([
                'message' => 'Le paiement a déjà été effectué',
            ], 400);
        }

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => (int) ($appointment->deposit_amount * 100), // Convert to cents
                'currency' => 'eur',
                'metadata' => [
                    'appointment_id' => $appointment->id,
                    'user_id' => Auth::id(),
                ],
            ]);

            // Create or update payment record
            Payment::updateOrCreate(
                [
                    'appointment_id' => $appointment->id,
                ],
                [
                    'user_id' => Auth::id(),
                    'payment_intent_id' => $paymentIntent->id,
                    'amount' => $appointment->deposit_amount,
                    'status' => 'pending',
                    'stripe_response' => $paymentIntent->toArray(),
                ]
            );

            return response()->json([
                'client_secret' => $paymentIntent->client_secret,
                'payment_intent_id' => $paymentIntent->id,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du paiement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Confirm payment and update appointment status.
     */
    public function confirmPayment(ConfirmPaymentRequest $request): JsonResponse
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);

            $payment = Payment::where('payment_intent_id', $paymentIntent->id)
                ->where('user_id', Auth::id())
                ->firstOrFail();

            $payment->update([
                'status' => $paymentIntent->status === 'succeeded' ? 'succeeded' : 'failed',
                'payment_method' => $paymentIntent->payment_method ?? null,
                'stripe_response' => $paymentIntent->toArray(),
            ]);

            if ($paymentIntent->status === 'succeeded') {
                $appointment = $payment->appointment;
                $appointment->update([
                    'status' => 'confirmed',
                ]);

                return response()->json([
                    'message' => 'Paiement confirmé avec succès',
                    'payment' => $payment,
                    'appointment' => $appointment,
                ]);
            }

            return response()->json([
                'message' => 'Le paiement n\'a pas réussi',
                'payment' => $payment,
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la confirmation du paiement',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
