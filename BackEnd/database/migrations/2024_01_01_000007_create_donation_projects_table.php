<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donation_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['puit', 'arbre', 'mosquee', 'ecole', 'orphelinat', 'eau', 'nourriture', 'autre']);
            $table->string('pays', 100);
            $table->string('nom', 255);
            $table->text('description')->nullable();
            $table->string('image', 500)->nullable();
            $table->decimal('montant_requis', 10, 2);
            $table->decimal('montant_collecte', 10, 2)->default(0);
            $table->decimal('progress_percentage', 5, 2)->default(0);
            $table->enum('statut', ['draft', 'active', 'completed', 'cancelled'])->default('draft');
            $table->boolean('is_featured')->default(false);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->integer('beneficiaries_count')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index('donation_user_id');
            $table->index('statut');
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donation_projects');
    }
};
