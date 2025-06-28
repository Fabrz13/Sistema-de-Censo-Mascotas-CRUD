<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('owners', function (Blueprint $table) {
            $table->string('photo_path')->nullable()->after('remember_token');
            $table->json('location')->nullable()->after('photo_path');
            $table->enum('status', ['HABILITADO', 'DESHABILITADO'])->default('HABILITADO')->after('location');
        });
    }

    public function down()
    {
        Schema::table('owners', function (Blueprint $table) {
            $table->dropColumn(['photo_path', 'location', 'status']);
        });
    }
};