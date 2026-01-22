<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calendar_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->string('timezone', 50)->default('UTC');
            $table->integer('slot_duration_default')->default(60);
            $table->integer('max_clients_default')->default(1);
            $table->decimal('price_default', 10, 2)->nullable();
            $table->integer('booking_advance_days')->default(90);
            $table->integer('min_booking_notice_hours')->default(24);
            $table->integer('max_bookings_per_day')->nullable();
            $table->boolean('auto_accept_bookings')->default(false);
            $table->integer('buffer_time_minutes')->default(0);
            $table->string('location_default', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_settings');
    }
};
