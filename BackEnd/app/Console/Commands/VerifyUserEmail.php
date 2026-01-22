<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class VerifyUserEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:verify-email {email}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Vérifier manuellement l\'email d\'un utilisateur (développement uniquement)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("Utilisateur avec l'email {$email} non trouvé.");
            return 1;
        }

        if ($user->hasVerifiedEmail()) {
            $this->info("L'email de {$user->email} est déjà vérifié.");
            return 0;
        }

        $user->markEmailAsVerified();

        $this->info("✅ Email de {$user->email} vérifié avec succès !");
        $this->info("L'utilisateur peut maintenant se connecter.");

        return 0;
    }
}
