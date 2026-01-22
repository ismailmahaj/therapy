<?php

namespace App\Http\Controllers\Api\Therapy;

use App\Http\Controllers\Controller;
use App\Http\Requests\Therapy\CreateSlotRequest;
use App\Http\Requests\Therapy\UpdateSlotRequest;
use App\Models\TherapySlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TherapySlotController extends Controller
{
    /**
     * Liste tous mes créneaux.
     */
    public function index(Request $request): JsonResponse
    {
        $query = TherapySlot::where('therapy_user_id', Auth::id())
            ->withCount('appointments');

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('from') && $request->has('to')) {
            $query->whereBetween('date', [$request->from, $request->to]);
        }

        $slots = $query->orderBy('date', 'asc')
            ->orderBy('start_time', 'asc')
            ->paginate(50);

        return response()->json($slots);
    }

    /**
     * Créer un nouveau créneau.
     */
    public function store(CreateSlotRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            // Vérifier chevauchement
            $overlapping = TherapySlot::where('therapy_user_id', Auth::id())
                ->where('date', $request->date)
                ->where(function ($q) use ($request) {
                    $q->whereBetween('start_time', [$request->start_time, $request->end_time])
                      ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                      ->orWhere(function ($q2) use ($request) {
                          $q2->where('start_time', '<=', $request->start_time)
                             ->where('end_time', '>=', $request->end_time);
                      });
                })
                ->exists();

            if ($overlapping) {
                return response()->json([
                    'message' => 'Ce créneau chevauche avec un autre créneau existant',
                ], 422);
            }

            // Calculer duration_minutes
            $start = Carbon::parse($request->start_time);
            $end = Carbon::parse($request->end_time);
            $durationMinutes = $request->duration_minutes ?? $start->diffInMinutes($end);

            // Récupérer le profil thérapeute pour obtenir le sexe
            $therapist = Auth::user();
            $therapistProfile = $therapist->therapistProfile;
            
            if (!$therapistProfile) {
                return response()->json([
                    'message' => 'Vous devez compléter votre profil thérapeute avant de créer des créneaux.',
                ], 422);
            }

            $slot = TherapySlot::create([
                'therapy_user_id' => Auth::id(),
                'date' => $request->date,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'duration_minutes' => $durationMinutes,
                'max_clients' => $request->max_clients,
                'booked_count' => 0,
                'statut' => 'available',
                'location' => $request->location,
                'price' => $request->price,
                'notes' => $request->notes,
                'sexe_therapeute' => $therapistProfile->sexe, // Automatique depuis le profil
                'hijama_type' => $request->hijama_type, // Type de hijama pour ce créneau
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Créneau créé avec succès',
                'slot' => $slot->loadCount('appointments'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la création du créneau',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Détail d'un créneau.
     */
    public function show(TherapySlot $slot): JsonResponse
    {
        $this->authorize('view', $slot);

        return response()->json([
            'slot' => $slot->load(['appointments.client', 'appointments.payment'])->loadCount('appointments'),
        ]);
    }

    /**
     * Modifier un créneau.
     */
    public function update(UpdateSlotRequest $request, TherapySlot $slot): JsonResponse
    {
        $this->authorize('update', $slot);

        // Vérifier si des rdv confirmés
        $hasConfirmedAppointments = $slot->appointments()->where('statut', 'confirmed')->exists();
        if ($hasConfirmedAppointments && ($request->has('date') || $request->has('start_time') || $request->has('end_time'))) {
            return response()->json([
                'message' => 'Impossible de modifier la date/heure d\'un créneau avec des rendez-vous confirmés',
            ], 422);
        }

        // Vérifier max_clients
        if ($request->has('max_clients') && $request->max_clients < $slot->booked_count) {
            return response()->json([
                'message' => 'Le nombre maximum de clients ne peut pas être inférieur au nombre de réservations',
            ], 422);
        }

        $slot->update($request->validated());

        return response()->json([
            'message' => 'Créneau mis à jour avec succès',
            'slot' => $slot->fresh()->loadCount('appointments'),
        ]);
    }

    /**
     * Supprimer un créneau.
     */
    public function destroy(TherapySlot $slot): JsonResponse
    {
        $this->authorize('delete', $slot);

        $slot->delete();

        return response()->json([
            'message' => 'Créneau supprimé avec succès',
        ]);
    }
}
