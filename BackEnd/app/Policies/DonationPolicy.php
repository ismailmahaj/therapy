<?php

namespace App\Policies;

use App\Models\Donation;
use App\Models\User;

class DonationPolicy
{
    /**
     * Determine if the user can view the donation.
     */
    public function view(User $user, Donation $donation): bool
    {
        return $user->id === $donation->user_id || $user->isAdmin();
    }

    /**
     * Determine if the user can update the donation.
     */
    public function update(User $user, Donation $donation): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine if the user can delete the donation.
     */
    public function delete(User $user, Donation $donation): bool
    {
        return $user->isAdmin();
    }
}
