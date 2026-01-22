<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Appointment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'slot_id',
        'therapy_user_id',
        'client_user_id',
        'statut',
        'payment_status',
        'montant_acompte',
        'payment_intent_id',
        'payment_method',
        'client_notes',
        'therapist_notes',
        'confirmed_at',
        'cancelled_at',
        'cancellation_reason',
        'completed_at',
        'total_personnes', // Nouveau : nombre total de personnes
    ];

    protected $casts = [
        'montant_acompte' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function slot()
    {
        return $this->belongsTo(TherapySlot::class, 'slot_id');
    }

    public function therapist()
    {
        return $this->belongsTo(User::class, 'therapy_user_id');
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    public function clientUser()
    {
        return $this->client();
    }

    public function user()
    {
        return $this->client();
    }

    public function payment()
    {
        return $this->hasOne(Payment::class, 'appointment_id');
    }

    /**
     * Relation avec les personnes du rendez-vous.
     */
    public function persons()
    {
        return $this->hasMany(AppointmentPerson::class)->orderBy('ordre');
    }

    /**
     * Vérifier si toutes les personnes sont du même sexe que le thérapeute.
     */
    public function validatePersonsSexe(): bool
    {
        if (!$this->slot || !$this->slot->sexe_therapeute) {
            return false;
        }

        $therapistSexe = $this->slot->sexe_therapeute;
        $persons = $this->persons;

        if ($persons->isEmpty()) {
            return false;
        }

        // Toutes les personnes doivent être du même sexe que le thérapeute
        return $persons->every(function ($person) use ($therapistSexe) {
            return $person->sexe === $therapistSexe;
        });
    }

    /**
     * Obtenir le sexe de toutes les personnes.
     */
    public function getPersonsSexes(): array
    {
        return $this->persons->pluck('sexe')->unique()->toArray();
    }

    public function isPending(): bool
    {
        return $this->statut === 'pending';
    }

    public function isConfirmed(): bool
    {
        return $this->statut === 'confirmed' && $this->payment_status === 'paid';
    }

    public function canBeCancelled(): bool
    {
        if ($this->statut === 'cancelled') {
            return false;
        }

        if (!$this->slot) {
            return false;
        }

        $hoursBeforeCancellation = config('appointment.cancellation_hours', 24);
        $appointmentDateTime = Carbon::parse($this->slot->date->format('Y-m-d') . ' ' . $this->slot->start_time);
        $deadline = $appointmentDateTime->copy()->subHours($hoursBeforeCancellation);
        
        return now()->lt($deadline);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('statut', 'confirmed');
    }

    public function scopeUpcoming($query)
    {
        return $query->whereHas('slot', function ($q) {
            $q->where('date', '>=', now()->toDateString());
        });
    }

    public function scopePast($query)
    {
        return $query->whereHas('slot', function ($q) {
            $q->where('date', '<', now()->toDateString());
        });
    }
}
