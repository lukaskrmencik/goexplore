<?php

namespace App\Models\Route;

use Illuminate\Database\Eloquent\Model;
use Clickbar\Magellan\Data\Geometries\Point;
use Clickbar\Magellan\Data\Geometries\LineString;

use App\Models\Camp\Camp;
use App\Models\Poi\Poi;
use App\Models\User\User;
use App\Models\Route\Waypoint;
use App\Models\Equipment\MyEquipment;
use App\Models\Equipment\GeneralEquipment;
use App\Models\Route\RouteEquipment;
use App\Models\Route\RoutePoi;
use App\Models\Route\RouteCamp;

class Route extends Model
{
    protected $table = 'routes';

    protected $fillable = [
        'users_id',
        'mode',
        'name',
        'start',
        'end',
        'start_date',
        'end_date',
        'axis',
        'complete_route',
        'buffer_size',
        'max_route_length_day',
        'poi_per_day'
    ];

    protected $casts = [
        'start' => Point::class,
        'end' => Point::class,
        'axis' => LineString::class,
        'complete_route' => LineString::class,
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'users_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'routes_users', 'routes_id', 'users_id')
            ->withTimestamps();
    }

    public function camps()
    {
        return $this->belongsToMany(Camp::class, 'routes_camps', 'routes_id', 'camps_id')
            ->withPivot('order')
            ->orderBy('pivot_order')
            ->withTimestamps();
    }

    public function poi()
    {
        return $this->belongsToMany(Poi::class, 'routes_poi', 'routes_id', 'poi_id')
            ->withPivot(['order', 'routes_clusters_id'])
            ->orderBy('pivot_order')
            ->withTimestamps();
    }

    public function waypoints()
    {
        return $this->hasMany(Waypoint::class, 'routes_id');
    }

    public function myEquipment()
    {
        return $this->belongsToMany(MyEquipment::class, 'routes_equipment', 'routes_id', 'my_equipment_id')
            ->withTimestamps();
    }

    public function generalEquipment()
    {
        return $this->belongsToMany(GeneralEquipment::class, 'routes_equipment', 'routes_id', 'general_equipment_id')
            ->withTimestamps();
    }

    public function equipment()
    {
        return $this->hasMany(RouteEquipment::class, 'routes_id');
    }

    public function allGeneralEquipment()
    {
        $direct = $this->generalEquipment()->get();

        $indirect = $this->myEquipment()->with('generalEquipment')->get()
                        ->pluck('generalEquipment')
                        ->flatten();

        return $direct->merge($indirect)->unique('id')->values();
    }
}
