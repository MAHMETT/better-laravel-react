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
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->index();
            $table->string('ip_address', 45);
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete()->index();
            $table->string('route_path');
            $table->string('route_name')->nullable()->index();
            $table->text('user_agent')->nullable();
            $table->string('device_type')->nullable();
            $table->string('referrer')->nullable();
            $table->timestamp('visited_at')->useCurrent()->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
