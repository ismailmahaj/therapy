<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Appointment\StoreAppointmentRequest;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    /**
     * Display a listing of appointments for the authenticated user.
     */
    public function index(): JsonResponse
    {
        $appointments = Appointment::where('user_id', Auth::id())
            ->with('payment')
            ->orderBy('appointment_date', 'desc')
            ->get();

        return response()->json([
            'appointments' => $appointments,
        ]);
    }

    /**
     * Get available slots for a date and gender.
     */
    public function availableSlots(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date',
            'gender' => 'required|in:homme,femme',
        ]);

        $slots = \App\Models\AvailabilitySlot::where('date', $request->date)
            ->where('gender', $request->gender)
            ->where('is_available', true)
            ->whereRaw('current_appointments < max_appointments')
            ->orderBy('start_time', 'asc')
            ->get()
            ->map(function ($slot) {
                return [
                    'id' => $slot->id,
                    'start_time' => $slot->start_time,
                    'end_time' => $slot->end_time,
                    'available_spots' => $slot->max_appointments - $slot->current_appointments,
                ];
            });

        return response()->json([
            'slots' => $slots,
        ]);
    }

    /**
     * Store a newly created appointment.
     */
    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        // Vérifier la disponibilité du créneau
        $appointmentDateTime = new \DateTime($request->appointment_date);
        $appointmentDate = $appointmentDateTime->format('Y-m-d');
        $appointmentTime = $appointmentDateTime->format('H:i:s');

        $slot = \App\Models\AvailabilitySlot::where('date', $appointmentDate)
            ->where('gender', $request->gender)
            ->where('start_time', '<=', $appointmentTime)
            ->where('end_time', '>=', $appointmentTime)
            ->where('is_available', true)
            ->first();

        if (!$slot || !$slot->canBook()) {
            return response()->json([
                'message' => 'Ce créneau n\'est pas disponible pour ce sexe',
            ], 400);
        }

        $unitPrice = config('appointment.unit_price', 50.00);
        $depositAmount = config('appointment.deposit_amount', 20.00);
        
        $numberOfPeople = $request->number_of_people;
        $totalPrice = $unitPrice * $numberOfPeople;

        $appointment = Appointment::create([
            'user_id' => Auth::id(),
            'type' => $request->type,
            'gender' => $request->gender,
            'appointment_date' => $request->appointment_date,
            'number_of_people' => $numberOfPeople,
            'unit_price' => $unitPrice,
            'total_price' => $totalPrice,
            'deposit_amount' => $depositAmount,
            'status' => 'pending',
        ]);

        // Incrémenter le nombre de rendez-vous sur le créneau
        $slot->incrementAppointments();

        return response()->json([
            'message' => 'Rendez-vous créé avec succès',
            'appointment' => $appointment->load('payment'),
        ], 201);
    }

    /**
     * Display the specified appointment.
     */
    public function show(Appointment $appointment): JsonResponse
    {
        if ($appointment->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json([
                'message' => 'Non autorisé',
            ], 403);
        }

        return response()->json([
            'appointment' => $appointment->load('payment', 'user'),
        ]);
    }

    /**
     * Cancel an appointment.
     */
    public function cancel(Appointment $appointment): JsonResponse
    {
        if ($appointment->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json([
                'message' => 'Non autorisé',
            ], 403);
        }

        if (!$appointment->canBeCancelled()) {
            return response()->json([
                'message' => 'Ce rendez-vous ne peut plus être annulé',
            ], 400);
        }

        $appointment->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'message' => 'Rendez-vous annulé avec succès',
            'appointment' => $appointment,
        ]);
    }
}
