<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Admin',
                'slug' => 'admin',
                'description' => 'Administrateur avec tous les droits',
            ],
            [
                'name' => 'Super Admin',
                'slug' => 'superadmin',
                'description' => 'Super administrateur',
            ],
            [
                'name' => 'Therapy',
                'slug' => 'therapy',
                'description' => 'Thérapeute - Peut créer et gérer des créneaux de rendez-vous',
            ],
            [
                'name' => 'Donation',
                'slug' => 'donation',
                'description' => 'Gestionnaire de donations - Peut créer et gérer des projets de donation',
            ],
            [
                'name' => 'Client',
                'slug' => 'client',
                'description' => 'Client - Peut réserver des rendez-vous et faire des donations',
            ],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(
                ['slug' => $role['slug']],
                $role
            );
        }

        $this->command->info('Rôles créés avec succès !');
    }
}
