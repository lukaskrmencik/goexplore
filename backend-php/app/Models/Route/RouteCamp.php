<?php

namespace App\Models\Route;

use Illuminate\Database\Eloquent\Model;
use App\Models\Camp\Camp;
use App\Models\Route\Route;

class RouteCamp extends Model
{
    protected $table = 'routes_camps';

    protected $fillable = [
        'routes_id',
        'camps_id',
        'order',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class, 'routes_id');
    }

    public function camp()
    {
        return $this->belongsTo(Camp::class, 'camps_id');
    }
}
