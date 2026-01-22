<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Role;
use Illuminate\Console\Command;

class AssignClientRoleToUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:assign-client-role';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Assigner le rôle "client" à tous les utilisateurs qui ne l\'ont pas';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $clientRole = Role::where('slug', 'client')->first();

        if (!$clientRole) {
            $this->error('Le rôle "client" n\'existe pas. Exécutez d\'abord php artisan db:seed --class=RoleSeeder');
            return 1;
        }

        $users = User::whereDoesntHave('roles', function ($query) use ($clientRole) {
            $query->where('roles.id', $clientRole->id);
        })->get();

        if ($users->isEmpty()) {
            $this->info('Tous les utilisateurs ont déjà le rôle "client".');
            return 0;
        }

        $this->info("Assignation du rôle 'client' à {$users->count()} utilisateur(s)...");

        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        foreach ($users as $user) {
            $user->roles()->attach($clientRole->id);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("✅ {$users->count()} utilisateur(s) ont maintenant le rôle 'client'.");

        return 0;
    }
}
