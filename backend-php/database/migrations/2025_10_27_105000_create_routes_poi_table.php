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

        Schema::create('routes_poi', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('poi_id');
            $table->foreign('poi_id')->references('id')->on('poi_schema.poi');
            $table->bigInteger('routes_id');
            $table->foreign('routes_id')->references('id')->on('routes');
            $table->bigInteger('routes_clusters_id')->nullable();
            $table->foreign('routes_clusters_id')->references('id')->on('routes_clusters');
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
        Schema::dropIfExists('routes_poi');
    }
};
