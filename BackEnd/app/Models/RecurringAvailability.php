<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class RecurringAvailability extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'day_of_week',
        'start_time',
        'end_time',
        'slot_duration_minutes',
        'max_clients_per_slot',
        'price_per_slot',
        'is_active',
        'valid_from',
        'valid_until',
    ];

    protected $casts = [
        'price_per_slot' => 'decimal:2',
        'is_active' => 'boolean',
        'valid_from' => 'date',
        'valid_until' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isActiveOn($date): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $carbonDate = Carbon::parse($date);

        if ($this->valid_from && $carbonDate->lt($this->valid_from)) {
            return false;
        }

        if ($this->valid_until && $carbonDate->gt($this->valid_until)) {
            return false;
        }

        return true;
    }

    public function generateSlotsForDate($date): array
    {
        $slots = [];
        $currentTime = Carbon::parse($this->start_time);
        $endTime = Carbon::parse($this->end_time);

        while ($currentTime->copy()->addMinutes($this->slot_duration_minutes)->lte($endTime)) {
            $slotStart = $currentTime->format('H:i:s');
            $slotEnd = $currentTime->copy()->addMinutes($this->slot_duration_minutes)->format('H:i:s');

            $slots[] = [
                'start_time' => $slotStart,
                'end_time' => $slotEnd,
                'duration_minutes' => $this->slot_duration_minutes,
                'max_clients' => $this->max_clients_per_slot,
                'price' => $this->price_per_slot,
            ];

            $currentTime->addMinutes($this->slot_duration_minutes);
        }

        return $slots;
    }
}
