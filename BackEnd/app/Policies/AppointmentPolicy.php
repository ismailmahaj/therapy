<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    /**
     * Determine if the user can view the appointment.
     */
    public function view(User $user, Appointment $appointment): bool
    {
        return $user->id === $appointment->client_user_id 
            || $user->id === $appointment->therapy_user_id 
            || $user->isAdmin();
    }

    /**
     * Determine if the user can create appointments.
     */
    public function create(User $user): bool
    {
        return $user->isClient() || $user->isAdmin();
    }

    /**
     * Determine if the user can update the appointment.
     */
    public function update(User $user, Appointment $appointment): bool
    {
        return $user->id === $appointment->therapy_user_id || $user->isAdmin();
    }

    /**
     * Determine if the user can cancel the appointment.
     */
    public function cancel(User $user, Appointment $appointment): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $appointment->client_user_id 
            || $user->id === $appointment->therapy_user_id;
    }
}
