<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('owners', function (Blueprint $table) {
            // Rol del usuario: cliente | veterinario | superadmin
            $table->string('role', 20)->default('cliente')->after('password')->index();
        });

        // Asegurar compatibilidad con datos existentes (si role quedara null por algún motivo)
        DB::table('owners')->whereNull('role')->update(['role' => 'cliente']);
    }

    public function down(): void
    {
        Schema::table('owners', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropColumn('role');
        });
    }
};
