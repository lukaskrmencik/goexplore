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

        Schema::create('waypoints', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('routes_id');
            $table->foreign('routes_id')->references('id')->on('routes');
            $table->magellanPoint('coordinates', 4326);
            $table->integer('order');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('waypoints');
    }
};

