<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TherapistProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sexe',
        'hijama_types',
        'autres_types',
    ];

    protected $casts = [
        'hijama_types' => 'array',
    ];

    /**
     * Relation avec l'utilisateur.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Vérifier si le thérapeute pratique un type de hijama.
     */
    public function practicesHijamaType(string $type): bool
    {
        return in_array($type, $this->hijama_types ?? []);
    }

    /**
     * Obtenir tous les types de hijama disponibles.
     */
    public static function getAvailableHijamaTypes(): array
    {
        return [
            'hijama_seche' => 'Hijama Sèche',
            'hijama_humide' => 'Hijama Humide',
            'hijama_sunnah' => 'Hijama Sunnah',
            'hijama_esthetique' => 'Hijama Esthétique',
            'autres' => 'Autres',
        ];
    }
}
