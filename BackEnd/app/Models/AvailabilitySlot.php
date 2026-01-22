<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AvailabilitySlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'start_time',
        'end_time',
        'gender',
        'is_available',
        'max_appointments',
        'current_appointments',
    ];

    protected $casts = [
        'date' => 'date',
        'is_available' => 'boolean',
    ];

    /**
     * Check if slot is fully booked.
     */
    public function isFullyBooked(): bool
    {
        return $this->current_appointments >= $this->max_appointments;
    }

    /**
     * Check if slot is available.
     */
    public function canBook(): bool
    {
        return $this->is_available && !$this->isFullyBooked();
    }

    /**
     * Increment current appointments.
     */
    public function incrementAppointments(): void
    {
        $this->increment('current_appointments');
        if ($this->isFullyBooked()) {
            $this->update(['is_available' => false]);
        }
    }

    /**
     * Decrement current appointments.
     */
    public function decrementAppointments(): void
    {
        $this->decrement('current_appointments');
        if ($this->current_appointments < $this->max_appointments) {
            $this->update(['is_available' => true]);
        }
    }
}
