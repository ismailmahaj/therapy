<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppointmentPerson extends Model
{
    use HasFactory;

    protected $fillable = [
        'appointment_id',
        'prenom',
        'sexe',
        'ordre',
    ];

    /**
     * Relation avec le rendez-vous.
     */
    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
