<?php

namespace App\Models\Route;

use Illuminate\Database\Eloquent\Model;
use App\Models\Camp\Camp;
use App\Models\User\User;
use App\Models\Route\Route;

class CampsOpinion extends Model
{
    protected $table = 'camps_opinions';
    public $timestamps = false;

    protected $fillable = [
        'camps_id',
        'users_id',
        'routes_id',
        'wants',
    ];

    public function camp()
    {
        return $this->belongsTo(Camp::class, 'camps_id');
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
