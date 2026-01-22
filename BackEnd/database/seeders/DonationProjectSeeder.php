<?php

namespace Database\Seeders;

use App\Models\DonationProject;
use App\Models\User;
use Illuminate\Database\Seeder;

class DonationProjectSeeder extends Seeder
{
    public function run(): void
    {
        $donationUser = User::whereHas('roles', function ($q) {
            $q->where('slug', 'donation');
        })->first();

        if (!$donationUser) {
            $this->command->warn('Aucun utilisateur avec le rôle "donation" trouvé. Créez-en un d\'abord.');
            return;
        }

        $projects = [
            [
                'type' => 'puit',
                'pays' => 'Sénégal',
                'nom' => 'Puits pour le village de Thiaroye',
                'description' => 'Construction d\'un puits pour fournir de l\'eau potable à plus de 500 habitants du village de Thiaroye.',
                'montant_requis' => 5000.00,
                'is_featured' => true,
                'start_date' => now()->subDays(30),
                'beneficiaries_count' => 500,
            ],
            [
                'type' => 'arbre',
                'pays' => 'Maroc',
                'nom' => 'Plantation de 1000 arbres fruitiers',
                'description' => 'Plantation d\'arbres fruitiers pour lutter contre la désertification et améliorer la sécurité alimentaire.',
                'montant_requis' => 3000.00,
                'is_featured' => true,
                'start_date' => now()->subDays(15),
                'beneficiaries_count' => 200,
            ],
            [
                'type' => 'mosquee',
                'pays' => 'Mali',
                'nom' => 'Construction de la mosquée Al-Ikhlas',
                'description' => 'Construction d\'une mosquée pour la communauté musulmane locale.',
                'montant_requis' => 15000.00,
                'is_featured' => false,
                'start_date' => now()->subDays(60),
                'beneficiaries_count' => 1000,
            ],
            [
                'type' => 'ecole',
                'pays' => 'Burkina Faso',
                'nom' => 'École primaire pour enfants démunis',
                'description' => 'Construction d\'une école primaire pour permettre l\'éducation aux enfants défavorisés.',
                'montant_requis' => 10000.00,
                'is_featured' => true,
                'start_date' => now()->subDays(45),
                'beneficiaries_count' => 300,
            ],
            [
                'type' => 'eau',
                'pays' => 'Niger',
                'nom' => 'Système d\'adduction d\'eau potable',
                'description' => 'Installation d\'un système d\'adduction d\'eau pour plusieurs villages.',
                'montant_requis' => 8000.00,
                'is_featured' => false,
                'start_date' => now()->subDays(20),
                'beneficiaries_count' => 800,
            ],
        ];

        foreach ($projects as $projectData) {
            DonationProject::create([
                'donation_user_id' => $donationUser->id,
                'montant_collecte' => rand(0, (int) ($projectData['montant_requis'] * 0.7)),
                'progress_percentage' => 0,
                'statut' => 'active',
                ...$projectData,
            ]);
        }

        // Mettre à jour les pourcentages de progression
        DonationProject::all()->each(function ($project) {
            if ($project->montant_requis > 0) {
                $percentage = ($project->montant_collecte / $project->montant_requis) * 100;
                $project->update(['progress_percentage' => min(100, $percentage)]);
            }
        });

        $this->command->info('✅ Projets de donations créés avec succès !');
    }
}
