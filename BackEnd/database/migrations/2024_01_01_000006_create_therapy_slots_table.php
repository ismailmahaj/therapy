<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('therapy_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('therapy_user_id')->constrained('users')->onDelete('cascade');
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('duration_minutes');
            $table->integer('max_clients')->default(1);
            $table->integer('booked_count')->default(0);
            $table->enum('statut', ['available', 'full', 'cancelled'])->default('available');
            $table->string('location', 255)->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['therapy_user_id', 'date', 'start_time']);
            $table->index('statut');
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('therapy_slots');
    }
};
