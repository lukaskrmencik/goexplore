<?php

namespace App\Models\Route;

use Illuminate\Database\Eloquent\Model;
use App\Models\Poi\Poi;
use App\Models\User\User;
use App\Models\Route\Route;

class PoiOpinion extends Model
{
    protected $table = 'poi_opinions';
    public $timestamps = false;

    protected $fillable = [
        'poi_id',
        'users_id',
        'routes_id',
        'wants',
    ];

    public function poi()
    {
        return $this->belongsTo(Poi::class, 'poi_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'users_id');
    }

    public function route()
    {
        return $this->belongsTo(Route::class, 'routes_id');
    }
}
