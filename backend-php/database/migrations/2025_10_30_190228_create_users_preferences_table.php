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

        Schema::create('users_preferences', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('users_id');
            $table->foreign('users_id')->references('id')->on('users');
            $table->bigInteger('poi_categories_id');
            $table->foreign('poi_categories_id')->references('id')->on('poi_schema.categories');
            $table->integer('value');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users_preferences');
    }
};
