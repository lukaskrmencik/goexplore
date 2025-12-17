<?php

namespace App\Models\Poi;

use Illuminate\Database\Eloquent\Model;
use App\Models\Poi\PoiOpeningHourMonth;

class PoiOpeningHourDay extends Model
{
    protected $table = 'poi_schema.opening_hours_day';

    public $timestamps = false;

    protected $fillable = [
        'month_id',
        'weekday',
        'time_from',
        'time_to',
        'timestamp'
    ];

    public function month()
    {
        return $this->belongsTo(PoiOpeningHourMonth::class, 'month_id', 'id');
    }
}
