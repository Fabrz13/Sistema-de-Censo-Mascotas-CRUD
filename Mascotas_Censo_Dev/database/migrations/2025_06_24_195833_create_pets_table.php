<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('species', ['perro', 'gato', 'otro']);
            $table->string('breed');
            $table->enum('size', ['pequeño', 'mediano', 'grande']);
            $table->integer('age');
            $table->boolean('vaccinated');
            $table->string('food_type');
            $table->string('photo_path')->nullable();
            $table->json('location')->nullable(); 
            $table->date('last_vaccination')->nullable();
            
            $table->foreignId('owner_id')->constrained()->onDelete('cascade');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pets');
    }
};
