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

        Schema::create('camps_opinions', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('camps_id');
            $table->foreign('camps_id')->references('id')->on('camps_schema.camps');
            $table->bigInteger('users_id');
            $table->foreign('users_id')->references('id')->on('users');
            $table->bigInteger('routes_id');
            $table->foreign('routes_id')->references('id')->on('routes');
            $table->boolean('wants');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('camps_opinions');
    }
};
