<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\TherapistProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // S'assurer que les rôles existent
        $this->call(RoleSeeder::class);

        // Récupérer les rôles
        $adminRole = Role::where('slug', 'admin')->first();
        $superAdminRole = Role::where('slug', 'superadmin')->first();
        $therapyRole = Role::where('slug', 'therapy')->first();
        $donationRole = Role::where('slug', 'donation')->first();
        $clientRole = Role::where('slug', 'client')->first();

        // 1. Utilisateur Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@hijama.com'],
            [
                'first_name' => 'Admin',
                'last_name' => 'Hijama',
                'name' => 'Admin Hijama',
                'phone' => '+33123456789',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'sexe' => 'homme',
                'email_verified_at' => now(),
            ]
        );
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);
        $this->command->info('✅ Admin créé : admin@hijama.com / password');

        // 2. Utilisateur SuperAdmin
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@hijama.com'],
            [
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'name' => 'Super Admin',
                'phone' => '+33987654321',
                'password' => Hash::make('password'),
                'role' => 'superadmin',
                'sexe' => 'homme',
                'email_verified_at' => now(),
            ]
        );
        $superAdmin->roles()->syncWithoutDetaching([$superAdminRole->id]);
        $this->command->info('✅ SuperAdmin créé : superadmin@hijama.com / password');

        // 3. Utilisateur Therapy (Thérapeute)
        $therapist = User::firstOrCreate(
            ['email' => 'therapist@hijama.com'],
            [
                'first_name' => 'Ahmed',
                'last_name' => 'Benali',
                'name' => 'Ahmed Benali',
                'phone' => '+33612345678',
                'password' => Hash::make('password'),
                'role' => 'user', // Compatibilité avec ENUM
                'sexe' => 'homme',
                'bio' => 'Thérapeute expérimenté en hijama thérapeutique avec plus de 10 ans d\'expérience.',
                'specialization' => 'Hijama Thérapeutique',
                'email_verified_at' => now(),
            ]
        );
        $therapist->roles()->syncWithoutDetaching([$therapyRole->id]);
        
        // Créer le profil thérapeute
        if (!$therapist->therapistProfile) {
            TherapistProfile::create([
                'user_id' => $therapist->id,
                'sexe' => 'homme',
                'hijama_types' => ['hijama_seche', 'hijama_humide', 'hijama_sunnah'],
            ]);
        }
        $this->command->info('✅ Thérapeute créé : therapist@hijama.com / password');

        // 4. Utilisateur Donation (Gestionnaire de donations)
        $donationManager = User::firstOrCreate(
            ['email' => 'donation@hijama.com'],
            [
                'first_name' => 'Fatima',
                'last_name' => 'Alaoui',
                'name' => 'Fatima Alaoui',
                'phone' => '+33698765432',
                'password' => Hash::make('password'),
                'role' => 'user', // Compatibilité avec ENUM
                'sexe' => 'femme',
                'bio' => 'Gestionnaire des projets de donations et sadaqa.',
                'email_verified_at' => now(),
            ]
        );
        $donationManager->roles()->syncWithoutDetaching([$donationRole->id]);
        $this->command->info('✅ Gestionnaire Donations créé : donation@hijama.com / password');

        // 5. Utilisateur Client
        $client = User::firstOrCreate(
            ['email' => 'client@hijama.com'],
            [
                'first_name' => 'Mohamed',
                'last_name' => 'Idrissi',
                'name' => 'Mohamed Idrissi',
                'phone' => '+33611111111',
                'password' => Hash::make('password'),
                'role' => 'user',
                'sexe' => 'homme',
                'email_verified_at' => now(),
            ]
        );
        $client->roles()->syncWithoutDetaching([$clientRole->id]);
        $this->command->info('✅ Client créé : client@hijama.com / password');

        $this->command->info('');
        $this->command->info('🎉 Tous les utilisateurs ont été créés avec succès !');
        $this->command->info('');
        $this->command->info('📋 Récapitulatif des comptes :');
        $this->command->info('   • Admin: admin@hijama.com / password');
        $this->command->info('   • SuperAdmin: superadmin@hijama.com / password');
        $this->command->info('   • Thérapeute: therapist@hijama.com / password');
        $this->command->info('   • Gestionnaire Donations: donation@hijama.com / password');
        $this->command->info('   • Client: client@hijama.com / password');
    }
}
