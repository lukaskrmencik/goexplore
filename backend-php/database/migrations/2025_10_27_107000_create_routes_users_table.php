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
        Schema::disableForeignKeyConstraints();

        Schema::create('routes_users', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('routes_id');
            $table->foreign('routes_id')->references('id')->on('routes');
            $table->bigInteger('users_id')->nullable();
            $table->foreign('users_id')->references('id')->on('users');
            $table->text('invite_token')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routes_users');
    }
};

