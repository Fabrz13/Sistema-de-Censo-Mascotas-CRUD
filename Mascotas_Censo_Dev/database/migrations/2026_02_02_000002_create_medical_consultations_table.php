<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medical_consultations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('pet_id')->constrained('pets')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('owners')->cascadeOnDelete();
            $table->foreignId('veterinarian_id')->constrained('owners')->cascadeOnDelete();

            $table->dateTime('scheduled_at');

            $table->string('status', 20)->default('PENDIENTE')->index();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['veterinarian_id', 'scheduled_at']);
            $table->index(['client_id', 'scheduled_at']);
            $table->index(['pet_id', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_consultations');
    }
};
