<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('avatar')
                ->references('id')
                ->on('media')
                ->nullOnDelete(); // atau restrictOnDelete()
        });
        Schema::table('media', function (Blueprint $table) {
            $table->foreign('uploaded_by')
                ->references('id')
                ->on('users')
                ->restrictOnDelete();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropForeign(['uploaded_by']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['avatar']);
        });
    }
};
