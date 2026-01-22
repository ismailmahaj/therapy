<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CreateAvailabilitySlotRequest;
use App\Models\Appointment;
use App\Models\AvailabilitySlot;
use App\Models\Donation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get all appointments.
     */
    public function appointments(): JsonResponse
    {
        $appointments = Appointment::with(['user', 'payment'])
            ->orderBy('appointment_date', 'desc')
            ->get();

        return response()->json([
            'appointments' => $appointments,
        ]);
    }

    /**
     * Get all users.
     */
    public function users(): JsonResponse
    {
        $users = User::withCount(['appointments', 'donations'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'users' => $users,
        ]);
    }

    /**
     * Get all donations.
     */
    public function donations(): JsonResponse
    {
        $donations = Donation::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'donations' => $donations,
        ]);
    }

    /**
     * Get all availability slots.
     */
    public function availabilitySlots(Request $request): JsonResponse
    {
        $query = AvailabilitySlot::query();

        if ($request->has('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->has('gender')) {
            $query->where('gender', $request->gender);
        }

        if ($request->has('available')) {
            $query->where('is_available', $request->boolean('available'));
        }

        $slots = $query->orderBy('date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json([
            'slots' => $slots,
        ]);
    }

    /**
     * Create availability slot.
     */
    public function createAvailabilitySlot(CreateAvailabilitySlotRequest $request): JsonResponse
    {
        $slot = AvailabilitySlot::create([
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'gender' => $request->gender,
            'max_appointments' => $request->max_appointments ?? 1,
            'is_available' => true,
            'current_appointments' => 0,
        ]);

        return response()->json([
            'message' => 'Créneau créé avec succès',
            'slot' => $slot,
        ], 201);
    }

    /**
     * Update availability slot.
     */
    public function updateAvailabilitySlot(Request $request, AvailabilitySlot $slot): JsonResponse
    {
        $request->validate([
            'is_available' => 'sometimes|boolean',
            'max_appointments' => 'sometimes|integer|min:1|max:10',
        ]);

        $slot->update($request->only(['is_available', 'max_appointments']));

        return response()->json([
            'message' => 'Créneau mis à jour avec succès',
            'slot' => $slot,
        ]);
    }

    /**
     * Delete availability slot.
     */
    public function deleteAvailabilitySlot(AvailabilitySlot $slot): JsonResponse
    {
        // Vérifier s'il y a des rendez-vous sur ce créneau
        $hasAppointments = Appointment::whereDate('appointment_date', $slot->date)
            ->whereTime('appointment_date', '>=', $slot->start_time)
            ->whereTime('appointment_date', '<=', $slot->end_time)
            ->where('gender', $slot->gender)
            ->exists();

        if ($hasAppointments) {
            return response()->json([
                'message' => 'Impossible de supprimer ce créneau car il contient des rendez-vous',
            ], 400);
        }

        $slot->delete();

        return response()->json([
            'message' => 'Créneau supprimé avec succès',
        ]);
    }
}
