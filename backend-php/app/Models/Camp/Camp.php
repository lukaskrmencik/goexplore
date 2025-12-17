<?php

namespace App\Models\Camp;

use Illuminate\Database\Eloquent\Model;
use Clickbar\Magellan\Data\Geometries\Point;
use App\Models\Route\Route;
use App\Models\Route\CampOpinion;

class Camp extends Model
{
    protected $table = 'camps_schema.camps';

    public $timestamps = false;

    protected $fillable = [
        'url',
        'name',
        'image_url',
        'lat',
        'lon',
        'operating_time_month_from',
        'operating_time_day_from',
        'operating_time_month_to',
        'operating_time_day_to',
        'web',
        'review',
        'review_count',
        'price_list_url',
        'accept_cards',
        'timestamp',
        'geom'
    ];

    protected $casts = [
        'geom' => Point::class,
    ];

    public function accommodationTypes()
    {
        return $this->belongsToMany(
            CampAccommodationType::class,
            'camps_schema.camp_accommodation_types',
            'camp_id',
            'accommodation_type_id'
        )->withPivot('id', 'timestamp');
    }

    public function equipment()
    {
        return $this->belongsToMany(
            CampEquipment::class,
            'camps_schema.camps_equipment',
            'camp_id',
            'equipment_id'
        )->withPivot('id', 'timestamp');
    }

    public function services()
    {
        return $this->belongsToMany(
            CampService::class,
            'camps_schema.camps_services',
            'camp_id',
            'service_id'
        )->withPivot('id', 'timestamp');
    }

    public function routes()
    {
        return $this->belongsToMany(Route::class, 'routes_camps', 'camps_id', 'routes_id')
                    ->withTimestamps();
    }

    public function opinions()
    {
        return $this->hasMany(CampsOpinion::class, 'camps_id');
    }
}
