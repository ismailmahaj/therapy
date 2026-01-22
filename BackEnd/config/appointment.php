<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Appointment Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration pour les rendez-vous Hijama
    |
    */

    'unit_price' => env('APPOINTMENT_UNIT_PRICE', 50.00),
    'deposit_amount' => env('APPOINTMENT_DEPOSIT_AMOUNT', 20.00),
    'cancellation_hours' => env('APPOINTMENT_CANCELLATION_HOURS', 24),
    'max_people' => env('APPOINTMENT_MAX_PEOPLE', 5),
    'min_people' => env('APPOINTMENT_MIN_PEOPLE', 1),

];
