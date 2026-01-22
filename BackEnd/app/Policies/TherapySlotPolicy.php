<?php

namespace App\Policies;

use App\Models\TherapySlot;
use App\Models\User;

class TherapySlotPolicy
{
    /**
     * Determine if the user can view the slot.
     */
    public function view(User $user, TherapySlot $slot): bool
    {
        return $user->id === $slot->therapy_user_id || $user->isAdmin();
    }

    /**
     * Determine if the user can create slots.
     */
    public function create(User $user): bool
    {
        return $user->isTherapyUser() || $user->isAdmin();
    }

    /**
     * Determine if the user can update the slot.
     */
    public function update(User $user, TherapySlot $slot): bool
    {
        return $user->id === $slot->therapy_user_id || $user->isAdmin();
    }

    /**
     * Determine if the user can delete the slot.
     */
    public function delete(User $user, TherapySlot $slot): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->id !== $slot->therapy_user_id) {
            return false;
        }

        // Ne pas permettre la suppression si des rdv confirmés
        return !$slot->appointments()->where('statut', 'confirmed')->exists();
    }
}
