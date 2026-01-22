<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendarSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'timezone',
        'slot_duration_default',
        'max_clients_default',
        'price_default',
        'booking_advance_days',
        'min_booking_notice_hours',
        'max_bookings_per_day',
        'auto_accept_bookings',
        'buffer_time_minutes',
        'location_default',
    ];

    protected $casts = [
        'price_default' => 'decimal:2',
        'auto_accept_bookings' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
