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
        Schema::table('therapy_slots', function (Blueprint $table) {
            $table->enum('sexe_therapeute', ['homme', 'femme'])->after('therapy_user_id');
            $table->string('hijama_type', 50)->nullable()->after('sexe_therapeute'); // Type de hijama pour ce créneau
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('therapy_slots', function (Blueprint $table) {
            $table->dropColumn(['sexe_therapeute', 'hijama_type']);
        });
    }
};
