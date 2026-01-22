<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use App\Notifications\VerifyEmailNotification;

class User extends Authenticatable implements JWTSubject, MustVerifyEmail
{
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new VerifyEmailNotification);
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'name',
        'email',
        'phone',
        'password',
        'role', // Gardé pour compatibilité avec JWT
        'sexe', // Nouveau : sexe obligatoire
        'avatar',
        'bio',
        'specialization',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [
            'role' => $this->role,
        ];
    }

    /**
     * Get the roles that belong to the user.
     */
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $roleSlug): bool
    {
        return $this->roles()->where('slug', $roleSlug)->exists();
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roleSlugs): bool
    {
        return $this->roles()->whereIn('slug', $roleSlugs)->exists();
    }

    /**
     * Get the therapy slots created by this user.
     */
    public function therapySlots()
    {
        return $this->hasMany(TherapySlot::class, 'therapy_user_id');
    }

    /**
     * Get the donation projects created by this user.
     */
    public function donationProjects()
    {
        return $this->hasMany(DonationProject::class, 'donation_user_id');
    }

    /**
     * Get the appointments made by this client.
     */
    public function myAppointments()
    {
        return $this->hasMany(Appointment::class, 'client_user_id');
    }

    /**
     * Get appointments where I am the therapist.
     */
    public function clientAppointments()
    {
        return $this->hasMany(Appointment::class, 'therapy_user_id');
    }

    /**
     * Get the donation contributions made by this client.
     */
    public function donationContributions()
    {
        return $this->hasMany(DonationContribution::class, 'client_user_id');
    }

    /**
     * Calendar settings.
     */
    public function calendarSettings()
    {
        return $this->hasOne(CalendarSetting::class);
    }

    /**
     * Recurring availabilities.
     */
    public function recurringAvailabilities()
    {
        return $this->hasMany(RecurringAvailability::class);
    }

    /**
     * Calendar exceptions.
     */
    public function calendarExceptions()
    {
        return $this->hasMany(CalendarException::class);
    }

    // Garder les anciennes relations pour compatibilité
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'client_user_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function donations()
    {
        return $this->hasMany(DonationContribution::class, 'client_user_id');
    }

    /**
     * Check if user is admin or superadmin.
     */
    public function isAdmin(): bool
    {
        return $this->hasAnyRole(['admin', 'superadmin']) || in_array($this->role, ['admin', 'superadmin']);
    }

    /**
     * Check if user is therapy user.
     */
    public function isTherapyUser(): bool
    {
        return $this->hasRole('therapy') || $this->role === 'therapy';
    }

    /**
     * Check if user is donation user.
     */
    public function isDonationUser(): bool
    {
        return $this->hasRole('donation') || $this->role === 'donation';
    }

    /**
     * Check if user is client.
     */
    public function isClient(): bool
    {
        return $this->hasRole('client') || $this->role === 'user';
    }

    /**
     * Get full name attribute.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Relation avec le profil thérapeute.
     */
    public function therapistProfile()
    {
        return $this->hasOne(TherapistProfile::class);
    }

    /**
     * Vérifier si l'utilisateur a un profil thérapeute.
     */
    public function hasTherapistProfile(): bool
    {
        return $this->therapistProfile !== null;
    }
}
