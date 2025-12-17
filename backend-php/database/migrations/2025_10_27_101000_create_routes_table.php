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

        Schema::create('routes', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('users_id');
            $table->string('name');
            $table->foreign('users_id')->references('id')->on('users');
            $table->enum('mode', ["simple","manual"]);
            $table->magellanPoint('start', 4326)->nullable();
            $table->magellanPoint('end', 4326)->nullable();
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->magellanLineString('axis', 4326)->nullable();
            $table->magellanLineString('complete_route', 4326)->nullable();
            $table->integer('buffer_size')->nullable();
            $table->integer('max_route_length_day')->nullable();
            $table->integer('poi_per_day')->nullable();
            $table->timestamps();
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routes');
    }
};
