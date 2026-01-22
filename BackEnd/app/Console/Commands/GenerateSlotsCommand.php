<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\TherapySlot;
use App\Models\RecurringAvailability;
use App\Models\CalendarException;
use App\Models\CalendarSetting;
use Illuminate\Console\Command;
use Carbon\Carbon;

class GenerateSlotsCommand extends Command
{
    protected $signature = 'therapy:generate-slots 
                            {--therapist_id= : ID du thérapeute spécifique}
                            {--days=30 : Nombre de jours à générer}';

    protected $description = 'Génère automatiquement les créneaux à partir des disponibilités récurrentes';

    public function handle()
    {
        $days = (int) $this->option('days');
        $therapistId = $this->option('therapist_id');

        $query = User::whereHas('roles', function ($q) {
            $q->where('slug', 'therapy');
        });

        if ($therapistId) {
            $query->where('id', $therapistId);
        }

        $therapists = $query->get();

        if ($therapists->isEmpty()) {
            $this->error('Aucun thérapeute trouvé');
            return 1;
        }

        $totalSlotsCreated = 0;

        foreach ($therapists as $therapist) {
            $this->info("Traitement du thérapeute : {$therapist->name} (ID: {$therapist->id})");

            $settings = CalendarSetting::where('user_id', $therapist->id)->first();
            $advanceDays = $settings?->booking_advance_days ?? 90;

            $fromDate = now()->toDateString();
            $toDate = now()->addDays(min($days, $advanceDays))->toDateString();

            $recurringAvailabilities = RecurringAvailability::where('user_id', $therapist->id)
                ->where('is_active', true)
                ->get();

            if ($recurringAvailabilities->isEmpty()) {
                $this->warn("  → Aucune disponibilité récurrente trouvée");
                continue;
            }

            $exceptions = CalendarException::where('user_id', $therapist->id)
                ->active()
                ->get();

            $slotsCreated = 0;
            $currentDate = Carbon::parse($fromDate);

            while ($currentDate->lte(Carbon::parse($toDate))) {
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
                        $exists = TherapySlot::where('therapy_user_id', $therapist->id)
                            ->where('date', $currentDate->toDateString())
                            ->where('start_time', $slotData['start_time'])
                            ->exists();

                        if (!$exists) {
                            TherapySlot::create([
                                'therapy_user_id' => $therapist->id,
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

            $totalSlotsCreated += $slotsCreated;
            $this->info("  → {$slotsCreated} créneaux créés");
        }

        $this->info("");
        $this->info("✅ Génération terminée. Total : {$totalSlotsCreated} créneaux créés.");

        return 0;
    }
}
