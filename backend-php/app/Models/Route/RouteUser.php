<?php

namespace App\Models\Route;

use Illuminate\Database\Eloquent\Model;
use App\Models\Route\Route;
use App\Models\User\User;

class RouteUser extends Model
{
    protected $table = 'routes_users';

    protected $fillable = [
        'routes_id',
        'users_id',
        'invite_token',
        'expires_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class, 'routes_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'users_id');
    }
}

