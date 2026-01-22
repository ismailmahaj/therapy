<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('therapist_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->enum('sexe', ['homme', 'femme']);
            $table->json('hijama_types')->nullable(); // ['hijama_seche', 'hijama_humide', 'hijama_sunnah', 'hijama_esthetique', 'autres']
            $table->text('autres_types')->nullable(); // Si 'autres' est sélectionné
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('therapist_profiles');
    }
};
