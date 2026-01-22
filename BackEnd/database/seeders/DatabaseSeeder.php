<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\TherapistProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed des rôles
        $this->call(RoleSeeder::class);
        
        // Seed des projets de donations (optionnel, peut être commenté si non nécessaire)
        // $this->call(DonationProjectSeeder::class);

        // Récupérer les rôles
        $adminRole = Role::where('slug', 'admin')->first();
        $superAdminRole = Role::where('slug', 'superadmin')->first();
        $therapyRole = Role::where('slug', 'therapy')->first();
        $donationRole = Role::where('slug', 'donation')->first();
        $clientRole = Role::where('slug', 'client')->first();

        // Créer Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@therapycenter.com'],
            [
                'first_name' => 'Admin',
                'last_name' => 'System',
                'name' => 'Admin System',
                'email' => 'admin@therapycenter.com',
                'phone' => '+33123456789',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'sexe' => 'homme', // Ajout du sexe
                'email_verified_at' => now(),
            ]
        );
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);

        // Créer SuperAdmin
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@therapycenter.com'],
            [
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'name' => 'Super Admin',
                'email' => 'superadmin@therapycenter.com',
                'phone' => '+33987654321',
                'password' => Hash::make('password'),
                'role' => 'superadmin',
                'sexe' => 'homme', // Ajout du sexe
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->roles()->syncWithoutDetaching([$superAdminRole->id]);

        // Créer Thérapeute
        $therapist = User::firstOrCreate(
            ['email' => 'therapist@therapycenter.com'],
            [
                'first_name' => 'Jean',
                'last_name' => 'Dupont',
                'name' => 'Jean Dupont',
                'email' => 'therapist@therapycenter.com',
                'phone' => '+33612345678',
                'password' => Hash::make('password'),
                'role' => 'user', // Compatibilité avec ENUM, le vrai rôle est dans roles
                'sexe' => 'homme', // Ajout du sexe
                'bio' => 'Thérapeute expérimenté en hijama thérapeutique',
                'specialization' => 'Hijama Thérapeutique',
                'email_verified_at' => now(),
            ]
        );
        $therapist->roles()->syncWithoutDetaching([$therapyRole->id]);
        
        // Créer le profil thérapeute
        if (!$therapist->therapistProfile) {
            $therapist->therapistProfile()->create([
                'sexe' => 'homme',
                'hijama_types' => ['hijama_seche', 'hijama_humide', 'hijama_sunnah'],
            ]);
        }

        // Créer Gestionnaire Donations
        $donationManager = User::firstOrCreate(
            ['email' => 'donation@therapycenter.com'],
            [
                'first_name' => 'Marie',
                'last_name' => 'Martin',
                'name' => 'Marie Martin',
                'email' => 'donation@therapycenter.com',
                'phone' => '+33698765432',
                'password' => Hash::make('password'),
                'role' => 'user', // Compatibilité avec ENUM, le vrai rôle est dans roles
                'sexe' => 'femme', // Ajout du sexe
                'bio' => 'Gestionnaire des projets de donations',
                'email_verified_at' => now(),
            ]
        );
        $donationManager->roles()->syncWithoutDetaching([$donationRole->id]);

        // Créer Client
        $client = User::firstOrCreate(
            ['email' => 'client@therapycenter.com'],
            [
                'first_name' => 'Ahmed',
                'last_name' => 'Alami',
                'name' => 'Ahmed Alami',
                'email' => 'client@therapycenter.com',
                'phone' => '+33611111111',
                'password' => Hash::make('password'),
                'role' => 'user',
                'sexe' => 'homme', // Ajout du sexe
                'email_verified_at' => now(),
            ]
        );
        $client->roles()->syncWithoutDetaching([$clientRole->id]);

        $this->command->info('✅ Seeders exécutés avec succès !');
        $this->command->info('');
        $this->command->info('📋 Comptes créés :');
        $this->command->info('Admin: admin@therapycenter.com / password');
        $this->command->info('SuperAdmin: superadmin@therapycenter.com / password');
        $this->command->info('Thérapeute: therapist@therapycenter.com / password');
        $this->command->info('Gestionnaire Donations: donation@therapycenter.com / password');
        $this->command->info('Client: client@therapycenter.com / password');
    }
}
