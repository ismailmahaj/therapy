<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\DonationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\Therapy\TherapySlotController;
use App\Http\Controllers\Api\Therapy\TherapyAppointmentController;
use App\Http\Controllers\Api\Calendar\CalendarController;
use App\Http\Controllers\Api\Donation\DonationProjectController;
use App\Http\Controllers\Api\Donation\DonationDocumentController;
use App\Http\Controllers\Api\Client\ClientAppointmentController;
use App\Http\Controllers\Api\Client\ClientDonationController;
use App\Http\Controllers\Api\Therapy\TherapistProfileController;
use App\Http\Controllers\Api\UserProfileController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Routes publiques AVEC middleware CORS (nécessaire pour les requêtes cross-origin)
Route::middleware([\App\Http\Middleware\CorsMiddleware::class])->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    
    // Route GET pour la vérification d'email (avec signature)
    Route::get('/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware('signed')
        ->name('verification.verify');
});

    // Routes protégées (nécessitent authentification)
    Route::middleware('auth:api')->group(function () {
        // Authentification
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        
        // Profil utilisateur (tous les rôles)
        Route::get('/profile', [UserProfileController::class, 'show']);
        Route::patch('/profile', [UserProfileController::class, 'update']);
        
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // MODULE THERAPY (role:therapy)
    Route::middleware('hasRole:therapy,admin,superadmin')->prefix('therapy')->group(function () {
        // Profil thérapeute
        Route::get('/profile', [TherapistProfileController::class, 'show']);
        Route::post('/profile', [TherapistProfileController::class, 'store']);
        Route::patch('/profile', [TherapistProfileController::class, 'update']);
        
        // Gestion des créneaux
        Route::apiResource('slots', TherapySlotController::class);
        Route::get('/slots/{slot}/appointments', [TherapyAppointmentController::class, 'slotAppointments']);
        
        // Gestion des rendez-vous reçus
        Route::get('/appointments', [TherapyAppointmentController::class, 'index']);
        Route::get('/appointments/{appointment}', [TherapyAppointmentController::class, 'show']);
        Route::patch('/appointments/{appointment}/complete', [TherapyAppointmentController::class, 'complete']);
    });
    
    // MODULE CALENDRIER (role:therapy)
    Route::middleware('hasRole:therapy,admin,superadmin')->prefix('therapy/calendar')->group(function () {
        Route::get('/settings', [CalendarController::class, 'settings']);
        Route::patch('/settings', [CalendarController::class, 'settings']);
        Route::get('/recurring-availabilities', [CalendarController::class, 'recurringAvailabilities']);
        Route::post('/recurring-availabilities', [CalendarController::class, 'storeRecurringAvailability']);
        Route::patch('/recurring-availabilities/{availability}', [CalendarController::class, 'updateRecurringAvailability']);
        Route::delete('/recurring-availabilities/{availability}', [CalendarController::class, 'destroyRecurringAvailability']);
        Route::post('/generate-slots', [CalendarController::class, 'generateSlots']);
        Route::get('/exceptions', [CalendarController::class, 'exceptions']);
        Route::post('/exceptions', [CalendarController::class, 'storeException']);
        Route::patch('/exceptions/{exception}', [CalendarController::class, 'updateException']);
        Route::delete('/exceptions/{exception}', [CalendarController::class, 'destroyException']);
        Route::get('/view', [CalendarController::class, 'view']);
    });
    
        // MODULE DONATION (role:donation)
        Route::middleware('hasRole:donation,admin,superadmin')->prefix('donation')->group(function () {
            Route::apiResource('projects', DonationProjectController::class);
            Route::patch('/projects/{project}/activate', [DonationProjectController::class, 'activate']);
            
            // Documents des projets
            Route::get('/projects/{project}/documents', [DonationDocumentController::class, 'index']);
            Route::post('/projects/{project}/documents', [DonationDocumentController::class, 'store']);
            Route::get('/documents/{document}/download', [DonationDocumentController::class, 'download']);
            Route::delete('/documents/{document}', [DonationDocumentController::class, 'destroy']);
        });
    
    // MODULE CLIENT - Appointments (role:client)
    Route::middleware('hasRole:client,admin,superadmin')->prefix('client/therapy')->group(function () {
        Route::get('/therapists', [ClientAppointmentController::class, 'therapists']);
        Route::get('/therapists/{therapist}/slots', [ClientAppointmentController::class, 'therapistSlots']);
        Route::get('/slots/available', [ClientAppointmentController::class, 'availableSlots']);
        Route::post('/appointments', [ClientAppointmentController::class, 'store']);
        Route::post('/appointments/multiple', [ClientAppointmentController::class, 'storeMultiple']);
        Route::post('/appointments/confirm-payment', [ClientAppointmentController::class, 'confirmPayment']);
        Route::get('/appointments', [ClientAppointmentController::class, 'myAppointments']);
        Route::get('/appointments/{appointment}', [ClientAppointmentController::class, 'show']);
        Route::patch('/appointments/{appointment}/cancel', [ClientAppointmentController::class, 'cancel']);
    });
    
        // MODULE CLIENT - Donations (role:client)
        Route::middleware('hasRole:client,admin,superadmin')->prefix('client/donation')->group(function () {
            Route::get('/projects', [ClientDonationController::class, 'projects']);
            Route::get('/projects/{project}', [ClientDonationController::class, 'showProject']);
            Route::post('/contributions', [ClientDonationController::class, 'contribute']);
            Route::post('/contributions/multiple', [ClientDonationController::class, 'contributeMultiple']);
            Route::post('/contributions/confirm-payment', [ClientDonationController::class, 'confirmPayment']);
            Route::post('/contributions/confirm-multiple-payments', [ClientDonationController::class, 'confirmMultiplePayments']);
            Route::get('/contributions', [ClientDonationController::class, 'myContributions']);
        });
    
    // Routes Admin (pour compatibilité)
    Route::middleware(['hasRole:admin,superadmin'])->prefix('admin')->group(function () {
        Route::get('/appointments', [AdminController::class, 'appointments']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/donations', [AdminController::class, 'donations']);
    });
});
