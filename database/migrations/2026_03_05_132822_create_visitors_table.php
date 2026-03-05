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
        Schema::create('visitors', function (Blueprint $table) {
            $table->id();
            $table->string('visitor_id')->unique()->index();
            $table->string('full_name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('company')->nullable();
            $table->string('purpose')->index(); // Meeting, Interview, Delivery, Maintenance, Other
            $table->string('region')->nullable()->index(); // Country/Region
            $table->string('country_code', 2)->nullable(); // ISO country code
            $table->foreignId('host_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('location')->nullable()->index();
            $table->string('site')->nullable()->index();
            $table->timestamp('check_in_at')->nullable()->index();
            $table->timestamp('check_out_at')->nullable();
            $table->string('status')->default('checked_in')->index(); // checked_in, checked_out, scheduled
            $table->boolean('is_returning')->default(false)->index();
            $table->text('notes')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();

            $table->index(['check_in_at', 'status']);
            $table->index(['created_at', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitors');
    }
};
