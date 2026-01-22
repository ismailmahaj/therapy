<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Supprimer d'abord la contrainte de clé étrangère dans payments
        if (Schema::hasTable('payments')) {
            try {
                Schema::table('payments', function (Blueprint $table) {
                    $table->dropForeign(['appointment_id']);
                });
            } catch (\Exception $e) {
                // Si la contrainte n'existe pas, continuer
            }
        }
        
        // Supprimer l'ancienne table si elle existe
        Schema::dropIfExists('appointments');
        
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('slot_id')->constrained('therapy_slots')->onDelete('cascade');
            $table->foreignId('therapy_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('client_user_id')->constrained('users')->onDelete('cascade');
            $table->enum('statut', ['pending', 'confirmed', 'cancelled', 'completed'])->default('pending');
            $table->enum('payment_status', ['pending', 'paid', 'refunded'])->default('pending');
            $table->decimal('montant_acompte', 10, 2);
            $table->string('payment_intent_id', 255)->nullable()->unique();
            $table->string('payment_method', 50)->nullable();
            $table->text('client_notes')->nullable();
            $table->text('therapist_notes')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->unique(['slot_id', 'client_user_id']);
            $table->index('therapy_user_id');
            $table->index('client_user_id');
            $table->index('statut');
            $table->index('payment_status');
        });
        
        // Recréer la contrainte de clé étrangère dans payments si la table existe
        if (Schema::hasTable('payments')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->foreign('appointment_id')->references('id')->on('appointments')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        // Supprimer la contrainte avant de supprimer la table
        if (Schema::hasTable('payments')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->dropForeign(['appointment_id']);
            });
        }
        
        Schema::dropIfExists('appointments');
    }
};
