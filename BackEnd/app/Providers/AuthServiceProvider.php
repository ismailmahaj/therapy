<?php

namespace App\Providers;

use App\Models\Appointment;
use App\Models\Donation;
use App\Models\TherapySlot;
use App\Models\DonationProject;
use App\Policies\AppointmentPolicy;
use App\Policies\DonationPolicy;
use App\Policies\TherapySlotPolicy;
use App\Policies\DonationProjectPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Appointment::class => AppointmentPolicy::class,
        Donation::class => DonationPolicy::class,
        TherapySlot::class => TherapySlotPolicy::class,
        DonationProject::class => DonationProjectPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}
