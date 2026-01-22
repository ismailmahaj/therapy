<?php

namespace App\Policies;

use App\Models\DonationProject;
use App\Models\User;

class DonationProjectPolicy
{
    /**
     * Determine if the user can view the project.
     */
    public function view(User $user, DonationProject $project): bool
    {
        // Les projets actifs sont visibles par tous
        if ($project->statut === 'active' || $project->statut === 'completed') {
            return true;
        }

        return $user->id === $project->donation_user_id || $user->isAdmin();
    }

    /**
     * Determine if the user can create projects.
     */
    public function create(User $user): bool
    {
        return $user->isDonationUser() || $user->isAdmin();
    }

    /**
     * Determine if the user can update the project.
     */
    public function update(User $user, DonationProject $project): bool
    {
        return $user->id === $project->donation_user_id || $user->isAdmin();
    }

    /**
     * Determine if the user can delete the project.
     */
    public function delete(User $user, DonationProject $project): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->id === $project->donation_user_id 
            && !$project->contributions()->where('statut', 'succeeded')->exists();
    }
}
