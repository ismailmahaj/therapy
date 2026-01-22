<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\CreateAppointmentRequest;
use App\Http\Requests\Client\CreateMultipleAppointmentsRequest;
use App\Models\Appointment;
use App\Models\AppointmentPerson;
use App\Models\TherapySlot;
use App\Models\User;
use App\Services\AppointmentValidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Services\PaymentService;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class ClientAppointmentController extends Controller
{
    protected AppointmentValidationService $validationService;

    public function __construct(AppointmentValidationService $validationService)
    {
        $this->validationService = $validationService;
    }
    /**
     * Liste des thérapeutes.
     */
    public function therapists(Request $request): JsonResponse
    {
        $query = User::whereHas('roles', function ($q) {
            $q->where('slug', 'therapy');
        })->orWhere('role', 'therapy');

        if ($request->has('specialization')) {
            $query->where('specialization', $request->specialization);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('name', 'like', "%{$request->search}%");
            });
        }

        $therapists = $query->select('id', 'first_name', 'last_name', 'name', 'avatar', 'bio', 'specialization')
            ->get();

        return response()->json(['therapists' => $therapists]);
    }

    /**
     * Créneaux disponibles d'un thérapeute.
     */
    public function therapistSlots(Request $request, User $therapist): JsonResponse
    {
        $query = TherapySlot::where('therapy_user_id', $therapist->id)
            ->where('statut', 'available')
            ->whereColumn('booked_count', '<', 'max_clients')
            ->where('date', '>=', now()->toDateString());

        if ($request->has('from_date')) {
            $query->where('date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('date', '<=', $request->to_date);
        }

        $slots = $query->orderBy('date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json(['slots' => $slots]);
    }

    /**
     * Tous les créneaux disponibles.
     */
    public function availableSlots(Request $request): JsonResponse
    {
        $query = TherapySlot::where('statut', 'available')
            ->whereColumn('booked_count', '<', 'max_clients')
            ->where('date', '>=', now()->toDateString())
            ->with('therapist:id,first_name,last_name,name,avatar,specialization');

        // Filtrer par sexe du client si fourni
        if ($request->has('client_sexe')) {
            $query->where('sexe_therapeute', $request->client_sexe);
        } else {
            // Si le client est authentifié, utiliser son sexe
            $client = Auth::user();
            if ($client && $client->sexe) {
                $query->where('sexe_therapeute', $client->sexe);
            }
        }

        // Filtrer par type de hijama si fourni
        if ($request->has('hijama_type')) {
            $query->where('hijama_type', $request->hijama_type);
        }

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->has('therapist_id')) {
            $query->where('therapy_user_id', $request->therapist_id);
        }

        if ($request->has('from_date')) {
            $query->where('date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('date', '<=', $request->to_date);
        }

        $slots = $query->orderBy('date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json(['slots' => $slots]);
    }

    /**
     * Réserver un rendez-vous.
     */
    public function store(CreateAppointmentRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $client = Auth::user();
            $slot = TherapySlot::findOrFail($request->slot_id);

            // VALIDATION STRICTE : Vérifier la compatibilité du sexe
            $validation = $this->validationService->validateClientCanBook(
                $client,
                $slot,
                $request->persons
            );

            if (!$validation['valid']) {
                DB::rollBack();
                return response()->json([
                    'message' => $validation['message'],
                ], 422);
            }

            if (!$slot->isAvailable()) {
                return response()->json([
                    'message' => 'Ce créneau n\'est plus disponible',
                ], 422);
            }

            // Vérifier le nombre de places
            $totalPersons = count($request->persons);
            if ($totalPersons > $slot->remainingSlots()) {
                return response()->json([
                    'message' => sprintf(
                        'Il ne reste que %d place(s) disponible(s) pour ce créneau.',
                        $slot->remainingSlots()
                    ),
                ], 422);
            }

            // Vérifier double réservation
            $existingAppointment = Appointment::where('slot_id', $slot->id)
                ->where('client_user_id', Auth::id())
                ->whereIn('statut', ['pending', 'confirmed'])
                ->exists();

            if ($existingAppointment) {
                return response()->json([
                    'message' => 'Vous avez déjà réservé ce créneau',
                ], 422);
            }

            // Créer appointment
            $appointment = Appointment::create([
                'slot_id' => $slot->id,
                'therapy_user_id' => $slot->therapy_user_id,
                'client_user_id' => Auth::id(),
                'statut' => 'pending',
                'payment_status' => 'pending',
                'montant_acompte' => $slot->price ?? 0,
                'client_notes' => $request->client_notes,
                'total_personnes' => $totalPersons,
            ]);

            // Créer les personnes du rendez-vous
            foreach ($request->persons as $index => $person) {
                AppointmentPerson::create([
                    'appointment_id' => $appointment->id,
                    'prenom' => $person['prenom'],
                    'sexe' => $person['sexe'],
                    'ordre' => $index + 1,
                ]);
            }

            // Créer PaymentIntent Stripe
            Stripe::setApiKey(config('services.stripe.secret'));
            $paymentIntent = PaymentIntent::create([
                'amount' => (int) ($appointment->montant_acompte * 100),
                'currency' => 'eur',
                'metadata' => [
                    'appointment_id' => $appointment->id,
                    'user_id' => Auth::id(),
                ],
            ]);
            
            $paymentIntentData = [
                'id' => $paymentIntent->id,
                'client_secret' => $paymentIntent->client_secret,
            ];

            $appointment->update([
                'payment_intent_id' => $paymentIntentData['id'],
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Rendez-vous créé. Veuillez compléter le paiement.',
                'appointment' => $appointment->load(['slot', 'therapist', 'persons']),
                'client_secret' => $paymentIntentData['client_secret'],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la réservation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Réserver plusieurs rendez-vous en une fois (pour personnes de sexes différents).
     * Permet de créer plusieurs rendez-vous avec des thérapeutes différents selon le sexe.
     */
    public function storeMultiple(CreateMultipleAppointmentsRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $client = Auth::user();
            $appointments = [];
            $paymentIntents = [];
            $totalAmount = 0;

            // Valider et créer chaque rendez-vous
            foreach ($request->appointments as $appointmentData) {
                $slot = TherapySlot::findOrFail($appointmentData['slot_id']);

                // VALIDATION : Vérifier la compatibilité du sexe
                $validation = $this->validationService->validateClientCanBook(
                    $client,
                    $slot,
                    $appointmentData['persons']
                );

                if (!$validation['valid']) {
                    DB::rollBack();
                    return response()->json([
                        'message' => $validation['message'],
                        'slot_id' => $slot->id,
                    ], 422);
                }

                if (!$slot->isAvailable()) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Un des créneaux n\'est plus disponible',
                        'slot_id' => $slot->id,
                    ], 422);
                }

                // Vérifier le nombre de places
                $totalPersons = count($appointmentData['persons']);
                if ($totalPersons > $slot->remainingSlots()) {
                    DB::rollBack();
                    return response()->json([
                        'message' => sprintf(
                            'Il ne reste que %d place(s) disponible(s) pour le créneau du %s.',
                            $slot->remainingSlots(),
                            $slot->date
                        ),
                        'slot_id' => $slot->id,
                    ], 422);
                }

                // Vérifier double réservation
                $existingAppointment = Appointment::where('slot_id', $slot->id)
                    ->where('client_user_id', Auth::id())
                    ->whereIn('statut', ['pending', 'confirmed'])
                    ->exists();

                if ($existingAppointment) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Vous avez déjà réservé un de ces créneaux',
                        'slot_id' => $slot->id,
                    ], 422);
                }

                // Créer appointment
                $appointment = Appointment::create([
                    'slot_id' => $slot->id,
                    'therapy_user_id' => $slot->therapy_user_id,
                    'client_user_id' => Auth::id(),
                    'statut' => 'pending',
                    'payment_status' => 'pending',
                    'montant_acompte' => $slot->price ?? 0,
                    'client_notes' => $appointmentData['client_notes'] ?? null,
                    'total_personnes' => $totalPersons,
                ]);

                // Créer les personnes du rendez-vous
                foreach ($appointmentData['persons'] as $index => $person) {
                    AppointmentPerson::create([
                        'appointment_id' => $appointment->id,
                        'prenom' => $person['prenom'],
                        'sexe' => $person['sexe'],
                        'ordre' => $index + 1,
                    ]);
                }

                $appointments[] = $appointment;
                $totalAmount += $appointment->montant_acompte;
            }

            // Créer un seul PaymentIntent pour tous les rendez-vous
            Stripe::setApiKey(config('services.stripe.secret'));
            $paymentIntent = PaymentIntent::create([
                'amount' => (int) ($totalAmount * 100),
                'currency' => 'eur',
                'metadata' => [
                    'appointment_ids' => implode(',', array_column($appointments, 'id')),
                    'user_id' => Auth::id(),
                    'count' => count($appointments),
                ],
            ]);

            // Mettre à jour tous les rendez-vous avec le même payment_intent_id
            foreach ($appointments as $appointment) {
                $appointment->update([
                    'payment_intent_id' => $paymentIntent->id,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => sprintf(
                    '%d rendez-vous créé(s). Veuillez compléter le paiement.',
                    count($appointments)
                ),
                'appointments' => Appointment::whereIn('id', array_column($appointments, 'id'))
                    ->with(['slot.therapist', 'persons'])
                    ->get(),
                'client_secret' => $paymentIntent->client_secret,
                'total_amount' => $totalAmount,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la réservation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Confirmer le paiement.
     */
    public function confirmPayment(Request $request): JsonResponse
    {
        $request->validate([
            'payment_intent_id' => ['required', 'string'],
        ]);

        DB::beginTransaction();
        try {
            // Récupérer tous les rendez-vous liés à ce payment_intent_id
            $appointments = Appointment::where('payment_intent_id', $request->payment_intent_id)
                ->where('client_user_id', Auth::id())
                ->get();

            if ($appointments->isEmpty()) {
                return response()->json([
                    'message' => 'Aucun rendez-vous trouvé pour ce paiement',
                ], 404);
            }

            Stripe::setApiKey(config('services.stripe.secret'));
            $paymentIntent = PaymentIntent::retrieve($request->payment_intent_id);

            if ($paymentIntent->status === 'succeeded') {
                // Confirmer tous les rendez-vous liés à ce paiement
                foreach ($appointments as $appointment) {
                    $appointment->update([
                        'statut' => 'confirmed',
                        'payment_status' => 'paid',
                        'confirmed_at' => now(),
                        'payment_method' => $paymentIntent->payment_method ?? null,
                    ]);

                    $appointment->slot->incrementAppointments();
                }

                DB::commit();

                $confirmedAppointments = Appointment::whereIn('id', $appointments->pluck('id'))
                    ->with(['slot.therapist', 'persons'])
                    ->get();

                return response()->json([
                    'message' => sprintf(
                        'Paiement confirmé. %d rendez-vous confirmé(s).',
                        $confirmedAppointments->count()
                    ),
                    'appointments' => $confirmedAppointments,
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
     * Mes rendez-vous.
     */
    public function myAppointments(Request $request): JsonResponse
    {
        $query = Appointment::where('client_user_id', Auth::id())
            ->with(['slot.therapist', 'payment'])
            ->orderBy('created_at', 'desc');

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->boolean('upcoming')) {
            $query->upcoming();
        }

        $appointments = $query->paginate(20);

        return response()->json($appointments);
    }

    /**
     * Détail d'un rendez-vous.
     */
    public function show(Appointment $appointment): JsonResponse
    {
        $this->authorize('view', $appointment);

        return response()->json([
            'appointment' => $appointment->load(['slot.therapist', 'payment', 'persons']),
        ]);
    }

    /**
     * Annuler un rendez-vous.
     */
    public function cancel(Request $request, Appointment $appointment): JsonResponse
    {
        $this->authorize('cancel', $appointment);

        if (!$appointment->canBeCancelled()) {
            return response()->json([
                'message' => 'Ce rendez-vous ne peut plus être annulé',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $appointment->update([
                'statut' => 'cancelled',
                'cancelled_at' => now(),
                'cancellation_reason' => $request->cancellation_reason,
            ]);

            if ($appointment->statut === 'confirmed') {
                $appointment->slot->decrementAppointments();
            }

            DB::commit();

            return response()->json([
                'message' => 'Rendez-vous annulé avec succès',
                'appointment' => $appointment->fresh(),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de l\'annulation',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
