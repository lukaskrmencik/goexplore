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

        Schema::create('my_equipment', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('users_id');
            $table->foreign('users_id')->references('id')->on('users');
            $table->string('name');
            $table->text('img')->nullable();
            $table->jsonb('specifications');
            $table->bigInteger('general_equipment_id');
            $table->foreign('general_equipment_id')->references('id')->on('general_equipment');
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('my_equipment');
    }
};

