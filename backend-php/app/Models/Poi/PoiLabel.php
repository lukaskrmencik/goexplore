<?php

namespace App\Models\Poi;

use Illuminate\Database\Eloquent\Model;
use App\Models\Poi\Poi;

class PoiLabel extends Model
{
    protected $table = 'poi_schema.labels';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'timestamp'
    ];

    public function pois()
    {
        return $this->belongsToMany(
            Poi::class,
            'poi_schema.poi_labels',
            'label_id',
            'poi_id'
        )->withPivot('id', 'timestamp');
    }
}
