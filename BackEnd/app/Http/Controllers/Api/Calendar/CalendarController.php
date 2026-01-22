<?php

namespace App\Http\Controllers\Api\Calendar;

use App\Http\Controllers\Controller;
use App\Http\Requests\Calendar\CreateRecurringAvailabilityRequest;
use App\Http\Requests\Calendar\CreateExceptionRequest;
use App\Models\CalendarSetting;
use App\Models\RecurringAvailability;
use App\Models\CalendarException;
use App\Models\TherapySlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class CalendarController extends Controller
{
    /**
     * Paramètres calendrier.
     */
    public function settings(Request $request): JsonResponse
    {
        $settings = CalendarSetting::firstOrCreate(
            ['user_id' => Auth::id()],
            [
                'timezone' => 'UTC',
                'slot_duration_default' => 60,
                'max_clients_default' => 1,
                'booking_advance_days' => 90,
                'min_booking_notice_hours' => 24,
                'auto_accept_bookings' => false,
                'buffer_time_minutes' => 0,
            ]
        );

        if ($request->isMethod('patch')) {
            $settings->update($request->only([
                'timezone', 'slot_duration_default', 'max_clients_default',
                'price_default', 'booking_advance_days', 'min_booking_notice_hours',
                'max_bookings_per_day', 'auto_accept_bookings', 'buffer_time_minutes',
                'location_default',
            ]));
        }

        return response()->json(['settings' => $settings]);
    }

    /**
     * Liste des disponibilités récurrentes.
     */
    public function recurringAvailabilities(): JsonResponse
    {
        $availabilities = RecurringAvailability::where('user_id', Auth::id())
            ->where('is_active', true)
            ->orderBy('day_of_week', 'asc')
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json(['availabilities' => $availabilities]);
    }

    /**
     * Créer disponibilité récurrente.
     */
    public function storeRecurringAvailability(CreateRecurringAvailabilityRequest $request): JsonResponse
    {
        $availability = RecurringAvailability::create([
            'user_id' => Auth::id(),
            ...$request->validated(),
        ]);

        return response()->json([
            'message' => 'Disponibilité récurrente créée',
            'availability' => $availability,
        ], 201);
    }

    /**
     * Modifier disponibilité récurrente.
     */
    public function updateRecurringAvailability(CreateRecurringAvailabilityRequest $request, RecurringAvailability $availability): JsonResponse
    {
        if ($availability->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $availability->update($request->validated());

        return response()->json([
            'message' => 'Disponibilité récurrente mise à jour',
            'availability' => $availability,
        ]);
    }

    /**
     * Supprimer disponibilité récurrente.
     */
    public function destroyRecurringAvailability(Request $request, RecurringAvailability $availability): JsonResponse
    {
        if ($availability->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $deleteFuture = $request->boolean('delete_future_slots', false);

        $availability->delete();

        if ($deleteFuture) {
            TherapySlot::where('therapy_user_id', Auth::id())
                ->where('date', '>=', now()->toDateString())
                ->where('created_at', '>=', $availability->created_at)
                ->delete();
        }

        return response()->json(['message' => 'Disponibilité récurrente supprimée']);
    }

    /**
     * Générer des créneaux manuellement.
     */
    public function generateSlots(Request $request): JsonResponse
    {
        $request->validate([
            'from_date' => ['required', 'date'],
            'to_date' => ['required', 'date', 'after:from_date'],
        ]);

        $fromDate = Carbon::parse($request->from_date);
        $toDate = Carbon::parse($request->to_date);

        if ($toDate->diffInDays($fromDate) > 90) {
            return response()->json(['message' => 'Période maximale de 90 jours'], 422);
        }

        $slotsCreated = 0;
        $settings = CalendarSetting::where('user_id', Auth::id())->first();
        $advanceDays = $settings?->booking_advance_days ?? 90;

        if ($toDate->gt(now()->addDays($advanceDays))) {
            return response()->json(['message' => 'Date trop éloignée'], 422);
        }

        $recurringAvailabilities = RecurringAvailability::where('user_id', Auth::id())
            ->where('is_active', true)
            ->get();

        $exceptions = CalendarException::where('user_id', Auth::id())
            ->active()
            ->get();

        $currentDate = $fromDate->copy();

        while ($currentDate->lte($toDate)) {
            $dayOfWeek = $currentDate->dayOfWeek === 0 ? 7 : $currentDate->dayOfWeek;

            // Vérifier exceptions
            $exception = $exceptions->first(function ($exc) use ($currentDate) {
                return $exc->affectsDate($currentDate->toDateString());
            });

            if ($exception && $exception->exception_type === 'unavailable') {
                $currentDate->addDay();
                continue;
            }

            $availabilities = $recurringAvailabilities->where('day_of_week', $dayOfWeek);

            foreach ($availabilities as $availability) {
                if (!$availability->isActiveOn($currentDate->toDateString())) {
                    continue;
                }

                $slots = $availability->generateSlotsForDate($currentDate->toDateString());

                foreach ($slots as $slotData) {
                    // Vérifier si slot existe déjà
                    $exists = TherapySlot::where('therapy_user_id', Auth::id())
                        ->where('date', $currentDate->toDateString())
                        ->where('start_time', $slotData['start_time'])
                        ->exists();

                    if (!$exists) {
                        TherapySlot::create([
                            'therapy_user_id' => Auth::id(),
                            'date' => $currentDate->toDateString(),
                            'start_time' => $slotData['start_time'],
                            'end_time' => $slotData['end_time'],
                            'duration_minutes' => $slotData['duration_minutes'],
                            'max_clients' => $slotData['max_clients'],
                            'price' => $slotData['price'],
                            'booked_count' => 0,
                            'statut' => 'available',
                        ]);

                        $slotsCreated++;
                    }
                }
            }

            $currentDate->addDay();
        }

        return response()->json([
            'message' => 'Créneaux générés avec succès',
            'slots_created' => $slotsCreated,
        ]);
    }

    /**
     * Liste des exceptions.
     */
    public function exceptions(Request $request): JsonResponse
    {
        $query = CalendarException::where('user_id', Auth::id());

        if ($request->has('from_date')) {
            $query->where('start_date', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where(function ($q) use ($request) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '<=', $request->to_date);
            });
        }

        if ($request->has('type')) {
            $query->where('exception_type', $request->type);
        }

        $exceptions = $query->orderBy('start_date', 'asc')->get();

        return response()->json(['exceptions' => $exceptions]);
    }

    /**
     * Créer exception.
     */
    public function storeException(CreateExceptionRequest $request): JsonResponse
    {
        $exception = CalendarException::create([
            'user_id' => Auth::id(),
            ...$request->validated(),
        ]);

        return response()->json([
            'message' => 'Exception créée',
            'exception' => $exception,
        ], 201);
    }

    /**
     * Modifier exception.
     */
    public function updateException(CreateExceptionRequest $request, CalendarException $exception): JsonResponse
    {
        if ($exception->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $exception->update($request->validated());

        return response()->json([
            'message' => 'Exception mise à jour',
            'exception' => $exception,
        ]);
    }

    /**
     * Supprimer exception.
     */
    public function destroyException(CalendarException $exception): JsonResponse
    {
        if ($exception->user_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $exception->delete();

        return response()->json(['message' => 'Exception supprimée']);
    }

    /**
     * Vue calendrier (semaine/mois/jour).
     */
    public function view(Request $request): JsonResponse
    {
        $request->validate([
            'view' => ['required', 'in:week,month,day'],
            'date' => ['required', 'date'],
        ]);

        $date = Carbon::parse($request->date);

        if ($request->view === 'week') {
            $startDate = $date->copy()->startOfWeek();
            $endDate = $date->copy()->endOfWeek();
        } elseif ($request->view === 'month') {
            $startDate = $date->copy()->startOfMonth();
            $endDate = $date->copy()->endOfMonth();
        } else {
            $startDate = $date->copy();
            $endDate = $date->copy();
        }

        $slots = TherapySlot::where('therapy_user_id', Auth::id())
            ->whereBetween('date', [$startDate, $endDate])
            ->with(['appointments.client'])
            ->orderBy('date', 'asc')
            ->orderBy('start_time', 'asc')
            ->get()
            ->groupBy(function ($slot) {
                return $slot->date->format('Y-m-d');
            });

        $days = [];
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            $daySlots = $slots->get($current->format('Y-m-d'), collect());

            $days[] = [
                'date' => $current->format('Y-m-d'),
                'day_of_week' => $current->dayOfWeek === 0 ? 7 : $current->dayOfWeek,
                'slots' => $daySlots->map(function ($slot) {
                    return [
                        'id' => $slot->id,
                        'start_time' => $slot->start_time,
                        'end_time' => $slot->end_time,
                        'booked_count' => $slot->booked_count,
                        'max_clients' => $slot->max_clients,
                        'statut' => $slot->statut,
                        'appointments' => $slot->appointments,
                    ];
                })->toArray(),
            ];

            $current->addDay();
        }

        return response()->json([
            'view_type' => $request->view,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'days' => $days,
        ]);
    }
}
