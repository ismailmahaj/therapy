<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DonationProject extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'donation_user_id',
        'type',
        'pays',
        'nom',
        'description',
        'image',
        'montant_requis',
        'montant_collecte',
        'statut',
        'progress_percentage',
        'is_featured',
        'start_date',
        'end_date',
        'beneficiaries_count',
    ];

    protected $casts = [
        'montant_requis' => 'decimal:2',
        'montant_collecte' => 'decimal:2',
        'progress_percentage' => 'decimal:2',
        'is_featured' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function donationUser()
    {
        return $this->belongsTo(User::class, 'donation_user_id');
    }

    public function contributions()
    {
        return $this->hasMany(DonationContribution::class, 'project_id');
    }

    public function documents()
    {
        return $this->hasMany(DonationDocument::class, 'project_id');
    }

    public function isComplete(): bool
    {
        return $this->montant_collecte >= $this->montant_requis;
    }

    public function addContribution(float $amount): void
    {
        $this->increment('montant_collecte', $amount);
        $this->updateProgressPercentage();
        
        if ($this->isComplete() && $this->statut === 'active') {
            $this->update(['statut' => 'completed']);
        }
    }

    protected function updateProgressPercentage(): void
    {
        if ($this->montant_requis > 0) {
            $percentage = ($this->montant_collecte / $this->montant_requis) * 100;
            $this->update(['progress_percentage' => min(100, $percentage)]);
        }
    }
}
