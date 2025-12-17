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

        Schema::create('routes_equipment', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('routes_id');
            $table->foreign('routes_id')->references('id')->on('routes');
            $table->bigInteger('general_equipment_id')->nullable();
            $table->foreign('general_equipment_id')->references('id')->on('general_equipment');
            $table->bigInteger('my_equipment_id')->nullable();
            $table->foreign('my_equipment_id')->references('id')->on('my_equipment');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routes_equipment');
    }
};
