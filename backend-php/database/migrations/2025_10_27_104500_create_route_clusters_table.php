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
        Schema::create('routes_clusters', function (Blueprint $table) {
            $table->id();
            $table->text('name');
            $table->magellanPoint('geom', 4326);
            $table->bigInteger('best_poi_id');
            $table->foreign('best_poi_id')->references('id')->on('poi_schema.poi');
            $table->bigInteger('routes_id');
            $table->foreign('routes_id')->references('id')->on('routes');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('routes_clusters');
    }
};
