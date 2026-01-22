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
        Schema::table('appointments', function (Blueprint $table) {
            $table->integer('total_personnes')->default(1)->after('client_user_id');
        });

        Schema::create('appointment_persons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained('appointments')->onDelete('cascade');
            $table->string('prenom', 100);
            $table->enum('sexe', ['homme', 'femme']);
            $table->integer('ordre')->default(1); // Ordre dans la liste
            $table->timestamps();
            
            $table->index('appointment_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointment_persons');
        
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('total_personnes');
        });
    }
};
