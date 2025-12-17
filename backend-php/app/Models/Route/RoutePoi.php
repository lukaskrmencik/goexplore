<?php

namespace App\Models\Route;

use Illuminate\Database\Eloquent\Model;
use App\Models\Route\Route;
use App\Models\Route\RouteCluster;
use App\Models\Poi\Poi;

class RoutePoi extends Model
{
    protected $table = 'routes_poi';

    protected $fillable = [
        'routes_id',
        'poi_id',
        'order',
        'routes_clusters_id',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class, 'routes_id');
    }

    public function poi()
    {
        return $this->belongsTo(Poi::class, 'poi_id');
    }

    public function cluster()
    {
        return $this->belongsTo(RouteCluster::class, 'routes_clusters_id');
    }
}
