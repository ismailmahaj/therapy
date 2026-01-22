<?php

namespace App\Console\Commands;

use App\Models\TherapySlot;
use Illuminate\Console\Command;
use Carbon\Carbon;

class CleanPastSlotsCommand extends Command
{
    protected $signature = 'therapy:clean-past-slots 
                            {--days=90 : Nombre de jours à conserver}
                            {--force : Force la suppression}';

    protected $description = 'Archive ou supprime les créneaux passés';

    public function handle()
    {
        $days = (int) $this->option('days');
        $force = $this->option('force');

        $cutoffDate = Carbon::now()->subDays($days)->toDateString();

        $query = TherapySlot::where('date', '<', $cutoffDate);

        if ($force) {
            $count = $query->count();
            $query->forceDelete();
            $this->info("✅ {$count} créneaux supprimés définitivement");
        } else {
            $count = $query->count();
            $query->delete();
            $this->info("✅ {$count} créneaux archivés (soft delete)");
        }

        return 0;
    }
}
