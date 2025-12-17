<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Model;
use App\Models\User\User;
use App\Models\Poi\PoiCategory;

class UsersPreference extends Model
{
    protected $table = 'users_preferences';
    public $timestamps = false;

    protected $fillable = [
        'users_id',
        'poi_categories_id',
        'value',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'users_id');
    }

    public function category()
    {
        return $this->belongsTo(PoiCategory::class, 'poi_categories_id');
    }
}
