<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donation_contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('donation_projects')->onDelete('cascade');
            $table->foreignId('client_user_id')->constrained('users')->onDelete('cascade');
            $table->decimal('montant', 10, 2);
            $table->string('nom_sadaqa', 255)->nullable();
            $table->string('payment_intent_id', 255)->nullable()->unique();
            $table->string('payment_method', 50)->nullable();
            $table->enum('statut', ['pending', 'succeeded', 'failed'])->default('pending');
            $table->json('stripe_response')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('project_id');
            $table->index('client_user_id');
            $table->index('statut');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donation_contributions');
    }
};
