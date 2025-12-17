<?php

namespace App\Models\Poi;

use Illuminate\Database\Eloquent\Model;
use App\Models\Poi\Poi;

class PoiTag extends Model
{
    protected $table = 'poi_schema.tags';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'timestamp'
    ];

    public function pois()
    {
        return $this->belongsToMany(
            Poi::class,
            'poi_schema.poi_tags',
            'tag_id',
            'poi_id'
        )->withPivot('id', 'timestamp');
    }
}
