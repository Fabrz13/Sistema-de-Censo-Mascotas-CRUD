<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('owners', function (Blueprint $table) {
            $table->string('email')->unique()->after('phone');
            $table->string('password')->after('email');
            $table->rememberToken()->after('password');
        });
    }

    public function down()
    {
        Schema::table('owners', function (Blueprint $table) {
            $table->dropColumn(['email', 'password', 'remember_token']);
        });
    }
};