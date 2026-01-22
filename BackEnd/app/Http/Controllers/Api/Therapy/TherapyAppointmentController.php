<?php

namespace App\Http\Controllers\Api\Therapy;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\TherapySlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TherapyAppointmentController extends Controller
{
    /**
     * Liste tous mes rendez-vous reçus.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Appointment::where('therapy_user_id', Auth::id())
            ->with(['slot', 'client', 'payment'])
            ->orderBy('created_at', 'desc');

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('date')) {
            $query->whereHas('slot', function ($q) use ($request) {
                $q->whereDate('date', $request->date);
            });
        }

        if ($request->has('client_id')) {
            $query->where('client_user_id', $request->client_id);
        }

        $appointments = $query->paginate(50);

        return response()->json($appointments);
    }

    /**
     * Détail d'un rendez-vous.
     */
    public function show(Appointment $appointment): JsonResponse
    {
        $this->authorize('view', $appointment);

        return response()->json([
            'appointment' => $appointment->load(['slot', 'client', 'payment']),
        ]);
    }

    /**
     * Rendez-vous d'un créneau spécifique.
     */
    public function slotAppointments(TherapySlot $slot): JsonResponse
    {
        $this->authorize('view', $slot);

        $appointments = Appointment::where('slot_id', $slot->id)
            ->with(['client', 'payment'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'slot' => $slot,
            'appointments' => $appointments,
        ]);
    }

    /**
     * Marquer un rendez-vous comme terminé.
     */
    public function complete(Request $request, Appointment $appointment): JsonResponse
    {
        $this->authorize('update', $appointment);

        $request->validate([
            'therapist_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $appointment->update([
            'statut' => 'completed',
            'completed_at' => now(),
            'therapist_notes' => $request->therapist_notes,
        ]);

        return response()->json([
            'message' => 'Rendez-vous marqué comme terminé',
            'appointment' => $appointment->fresh()->load(['slot', 'client']),
        ]);
    }
}
