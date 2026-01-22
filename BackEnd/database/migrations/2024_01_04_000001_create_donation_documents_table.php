<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donation_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('donation_projects')->onDelete('cascade');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->string('file_path', 500);
            $table->string('file_name', 255);
            $table->string('file_type', 50)->nullable(); // pdf, image, etc.
            $table->unsignedBigInteger('file_size')->nullable(); // en bytes
            $table->timestamps();
            
            // Pas de soft deletes : historique immuable
            $table->index('project_id');
            $table->index('uploaded_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donation_documents');
    }
};
