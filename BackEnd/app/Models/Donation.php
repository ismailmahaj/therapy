<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'sadaqa_name',
        'payment_intent_id',
        'status',
        'stripe_response',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'stripe_response' => 'array',
    ];

    /**
     * Get the user that owns the donation.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if donation is successful.
     */
    public function isSuccessful(): bool
    {
        return $this->status === 'succeeded';
    }
}
