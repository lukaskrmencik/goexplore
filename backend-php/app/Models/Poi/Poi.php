<?php

namespace App\Models\Poi;

use Illuminate\Database\Eloquent\Model;
use Clickbar\Magellan\Data\Geometries\Point;
use App\Models\Route\Route;
use App\Models\Poi\PoiCategory;
use App\Models\Poi\PoiLabel;
use App\Models\Poi\PoiTag;
use App\Models\Poi\PoiOpeningHourMonth;
use App\Models\Route\PoiOpinion;

class Poi extends Model
{
    protected $table = 'poi_schema.poi';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'kudyznudy_url',
        'lat',
        'lon',
        'image_url',
        'review',
        'review_count',
        'article_popularity',
        'time_required',
        'price',
        'discounted_price',
        'website',
        'category_id',
        'has_opening_hours',
        'timestamp',
        'geom'
    ];

    protected $casts = [
        'geom' => Point::class,
    ];

    public function routes()
    {
        return $this->belongsToMany(Route::class, 'routes_poi', 'poi_id', 'routes_id')
                    ->withTimestamps();
    }

    public function category()
    {
        return $this->belongsTo(PoiCategory::class, 'category_id', 'id');
    }

    public function labels()
    {
        return $this->belongsToMany(
            PoiLabel::class,
            'poi_schema.poi_labels',
            'poi_id',
            'label_id'
        )->withPivot('id', 'timestamp');
    }

    public function tags()
    {
        return $this->belongsToMany(
            PoiTag::class,
            'poi_schema.poi_tags',
            'poi_id',
            'tag_id'
        )->withPivot('id', 'timestamp');
    }

    public function openingHoursMonths()
    {
        return $this->hasMany(PoiOpeningHourMonth::class, 'poi_id', 'id');
    }

    public function getOpeningHoursFullAttribute() {
        $result = [];
        foreach ($this->openingHoursMonths as $month) {
            $daysArr = [];
            foreach ($month->days as $day) {
                $daysArr[$day->weekday] = [
                    'from' => $day->time_from,
                    'to'   => $day->time_to
                ];
            }

            $result[] = [
                'month_from' => $month->month_from,
                'month_to'   => $month->month_to,
                'days'       => $daysArr
            ];
        }
        return $result;
    }

    public function opinions()
    {
        return $this->hasMany(PoiOpinion::class, 'poi_id');
    }


}
