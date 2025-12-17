<?php

namespace App\Models\Poi;

use Illuminate\Database\Eloquent\Model;
use App\Models\Poi\Poi;
use App\Models\User\UserPreference;

class PoiCategory extends Model
{
    protected $table = 'poi_schema.categories';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'timestamp'
    ];

    public function pois()
    {
        return $this->hasMany(Poi::class, 'category_id', 'id');
    }

    public function preferences()
    {
        return $this->hasMany(UserPreference::class, 'poi_categories_id');
    }
}
