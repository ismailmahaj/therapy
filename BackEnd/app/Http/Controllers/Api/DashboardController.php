<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\DonationContribution;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Get dashboard overview.
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();

        // Utiliser la nouvelle structure V2
        $upcomingAppointments = Appointment::where('client_user_id', $user->id)
            ->where('statut', '!=', 'cancelled')
            ->whereHas('slot', function ($q) {
                $q->whereDate('date', '>=', now()->toDateString());
            })
            ->with(['slot', 'therapist', 'payment'])
            ->orderBy('created_at', 'asc')
            ->limit(5)
            ->get();

        // Utiliser DonationContribution au lieu de Donation
        $totalDonations = DonationContribution::where('client_user_id', $user->id)
            ->where('statut', 'succeeded')
            ->sum('montant');

        return response()->json([
            'user' => $user,
            'upcoming_appointments' => $upcomingAppointments,
            'total_donations' => $totalDonations,
        ]);
    }

    /**
     * Get user appointments.
     */
    public function appointments(): JsonResponse
    {
        $appointments = Appointment::where('client_user_id', Auth::id())
            ->with(['slot', 'therapist', 'payment'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'appointments' => $appointments,
        ]);
    }

    /**
     * Get user donations.
     */
    public function donations(): JsonResponse
    {
        $donations = DonationContribution::where('client_user_id', Auth::id())
            ->with(['project.donationUser'])
            ->orderBy('created_at', 'desc')
            ->get();

        $total = DonationContribution::where('client_user_id', Auth::id())
            ->where('statut', 'succeeded')
            ->sum('montant');

        return response()->json([
            'donations' => $donations,
            'total' => $total,
        ]);
    }
}
