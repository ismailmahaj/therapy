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
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['puit', 'arbre', 'mosquee']);
            $table->decimal('amount', 10, 2);
            $table->string('sadaqa_name')->nullable();
            $table->string('payment_intent_id')->unique()->nullable();
            $table->enum('status', ['pending', 'succeeded', 'failed'])->default('pending');
            $table->json('stripe_response')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('type');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
