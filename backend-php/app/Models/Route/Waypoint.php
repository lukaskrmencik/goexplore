<?php

namespace App\Models\Route;

use Illuminate\Database\Eloquent\Model;
use Clickbar\Magellan\Data\Geometries\Point;

use App\Models\Route\Route;

class Waypoint extends Model
{
    protected $table = 'waypoints';

    protected $fillable = [
        'routes_id',
        'coordinates',
        'order'
    ];

    protected $casts = ['coordinates' => Point::class];

    public function route()
    {
        return $this->belongsTo(Route::class, 'routes_id');
    }
}
