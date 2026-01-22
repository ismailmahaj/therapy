<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\TherapySlot;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class AppointmentValidationService
{
    /**
     * Valider la compatibilité du sexe entre thérapeute et personnes.
     *
     * @param TherapySlot $slot
     * @param array $persons Array of ['prenom' => string, 'sexe' => 'homme'|'femme']
     * @return array ['valid' => bool, 'message' => string]
     */
    public function validateSexeCompatibility(TherapySlot $slot, array $persons): array
    {
        if (empty($persons)) {
            return [
                'valid' => false,
                'message' => 'Au moins une personne doit être renseignée.',
            ];
        }

        $therapistSexe = $slot->sexe_therapeute;

        if (!$therapistSexe) {
            Log::error('Slot sans sexe thérapeute', ['slot_id' => $slot->id]);
            return [
                'valid' => false,
                'message' => 'Erreur : le créneau n\'a pas de sexe thérapeute défini.',
            ];
        }

        // Vérifier que toutes les personnes sont du même sexe
        $sexes = array_unique(array_column($persons, 'sexe'));
        
        if (count($sexes) > 1) {
            return [
                'valid' => false,
                'message' => 'Les personnes concernées doivent être toutes du même sexe. Pour des personnes de sexes différents, créez des rendez-vous séparés avec des thérapeutes appropriés.',
            ];
        }

        $personSexe = $sexes[0];

        // Vérifier la compatibilité avec le thérapeute
        if ($personSexe !== $therapistSexe) {
            return [
                'valid' => false,
                'message' => sprintf(
                    'Les personnes concernées doivent être du même sexe que le thérapeute (%s). Veuillez sélectionner un thérapeute %s.',
                    $therapistSexe === 'homme' ? 'homme' : 'femme',
                    $therapistSexe === 'homme' ? 'homme' : 'femme'
                ),
            ];
        }

        return [
            'valid' => true,
            'message' => 'Validation réussie.',
        ];
    }

    /**
     * Valider qu'un client peut réserver un créneau.
     *
     * @param User $client
     * @param TherapySlot $slot
     * @param array $persons
     * @return array ['valid' => bool, 'message' => string]
     */
    public function validateClientCanBook(User $client, TherapySlot $slot, array $persons): array
    {
        // Vérifier le sexe du client
        if (!$client->sexe) {
            return [
                'valid' => false,
                'message' => 'Votre profil ne contient pas votre sexe. Veuillez compléter votre profil.',
            ];
        }

        // Vérifier la compatibilité des personnes
        $sexeValidation = $this->validateSexeCompatibility($slot, $persons);
        if (!$sexeValidation['valid']) {
            return $sexeValidation;
        }

        // Vérifier que le créneau est disponible
        if (!$slot->isAvailable()) {
            return [
                'valid' => false,
                'message' => 'Ce créneau n\'est plus disponible.',
            ];
        }

        // Vérifier le nombre de places
        $totalPersons = count($persons);
        if ($totalPersons > $slot->remainingSlots()) {
            return [
                'valid' => false,
                'message' => sprintf(
                    'Il ne reste que %d place(s) disponible(s) pour ce créneau.',
                    $slot->remainingSlots()
                ),
            ];
        }

        return [
            'valid' => true,
            'message' => 'Validation réussie.',
        ];
    }

    /**
     * Filtrer les créneaux disponibles selon le sexe et le type de hijama.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string|null $clientSexe
     * @param string|null $hijamaType
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function filterAvailableSlots($query, ?string $clientSexe = null, ?string $hijamaType = null)
    {
        // Filtrer par sexe du thérapeute
        if ($clientSexe) {
            $query->where('sexe_therapeute', $clientSexe);
        }

        // Filtrer par type de hijama
        if ($hijamaType) {
            $query->where('hijama_type', $hijamaType);
        }

        // Filtrer uniquement les créneaux disponibles
        $query->where('statut', 'available')
            ->whereColumn('booked_count', '<', 'max_clients')
            ->where('date', '>=', now()->toDateString());

        return $query;
    }
}
