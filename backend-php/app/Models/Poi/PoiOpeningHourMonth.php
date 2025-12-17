<?php

namespace App\Models\Poi;

use Illuminate\Database\Eloquent\Model;
use App\Models\Poi\PoiOpeningHourDay;
use App\Models\Poi\Poi;

class PoiOpeningHourMonth extends Model
{
    protected $table = 'poi_schema.opening_hours_month';

    public $timestamps = false;

    protected $fillable = [
        'poi_id',
        'month_from',
        'month_to',
        'timestamp'
    ];

    public function poi()
    {
        return $this->belongsTo(Poi::class, 'poi_id', 'id');
    }

    public function days()
    {
        return $this->hasMany(PoiOpeningHourDay::class, 'month_id', 'id');
    }
}
