<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TherapySlot extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'therapy_user_id',
        'date',
        'start_time',
        'end_time',
        'duration_minutes',
        'max_clients',
        'booked_count',
        'statut',
        'location',
        'price',
        'notes',
        'sexe_therapeute', // Nouveau : sexe du thérapeute
        'hijama_type', // Nouveau : type de hijama
    ];

    protected $casts = [
        'date' => 'date',
        'price' => 'decimal:2',
    ];

    public function therapist()
    {
        return $this->belongsTo(User::class, 'therapy_user_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'slot_id');
    }

    public function availableAppointments()
    {
        return $this->hasMany(Appointment::class, 'slot_id')
            ->where('statut', '!=', 'cancelled');
    }

    public function isAvailable(): bool
    {
        return $this->statut === 'available' && $this->booked_count < $this->max_clients;
    }

    public function isFull(): bool
    {
        return $this->booked_count >= $this->max_clients;
    }

    public function remainingSlots(): int
    {
        return max(0, $this->max_clients - $this->booked_count);
    }

    public function scopeAvailable($query)
    {
        return $query->where('statut', 'available')
            ->whereColumn('booked_count', '<', 'max_clients');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('date', '>=', now()->toDateString());
    }

    public function scopeByDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    /**
     * Increment booked count.
     */
    public function incrementAppointments(): void
    {
        $this->increment('booked_count');
        if ($this->isFull()) {
            $this->update(['statut' => 'full']);
        }
    }

    /**
     * Decrement booked count.
     */
    public function decrementAppointments(): void
    {
        $this->decrement('booked_count');
        if ($this->statut === 'full' && !$this->isFull()) {
            $this->update(['statut' => 'available']);
        }
    }

    // Alias pour compatibilité
    public function incrementClients(): void
    {
        $this->incrementAppointments();
    }

    public function decrementClients(): void
    {
        $this->decrementAppointments();
    }

    /**
     * Scope pour filtrer par sexe du thérapeute.
     */
    public function scopeByTherapistSexe($query, string $sexe)
    {
        return $query->where('sexe_therapeute', $sexe);
    }

    /**
     * Scope pour filtrer par type de hijama.
     */
    public function scopeByHijamaType($query, string $type)
    {
        return $query->where('hijama_type', $type);
    }

    /**
     * Vérifier si le créneau est compatible avec le sexe du client.
     */
    public function isCompatibleWithSexe(string $clientSexe): bool
    {
        return $this->sexe_therapeute === $clientSexe;
    }
}
