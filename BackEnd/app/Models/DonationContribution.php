<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DonationContribution extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'project_id',
        'client_user_id',
        'montant',
        'nom_sadaqa',
        'payment_intent_id',
        'statut',
        'payment_method',
        'stripe_response',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'stripe_response' => 'array',
    ];

    public function project()
    {
        return $this->belongsTo(DonationProject::class, 'project_id');
    }

    public function clientUser()
    {
        return $this->belongsTo(User::class, 'client_user_id');
    }

    public function client()
    {
        return $this->clientUser();
    }

    public function isSuccessful(): bool
    {
        return $this->statut === 'succeeded';
    }
}
