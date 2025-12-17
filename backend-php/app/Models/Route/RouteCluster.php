<?php

namespace App\Models\Route;
use Clickbar\Magellan\Data\Geometries\Point;

use Illuminate\Database\Eloquent\Model;

class RouteCluster extends Model
{
    protected $table = 'routes_clusters';

    protected $fillable = [
        'name',
        'geom',
        'best_poi_id',
        'routes_id',
    ];

    protected $casts = [
        'geom' => Point::class,
    ];
}
