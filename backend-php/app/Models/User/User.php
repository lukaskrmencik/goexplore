<?php

namespace App\Models\User;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Clickbar\Magellan\Data\Geometries\Point;
use Tymon\JWTAuth\Contracts\JWTSubject;

use App\Models\Route\Route;
use App\Models\Equipment\MyEquipment;
use App\Models\Route\CampsOpinion;
use App\Models\Route\PoiOpinion;
use App\Models\User\UsersPreference;

class User extends Authenticatable implements JWTSubject
{
    protected $table = 'users';
    protected $fillable = [
        'profile_picture',
        'name',
        'email',
        'password',
        'role',
        'location'
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'location' => Point::class
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }

    public function routes()
    {
        return $this->hasMany(Route::class, 'users_id');
    }

    public function sharedRoutes()
    {
        return $this->belongsToMany(Route::class, 'routes_users', 'users_id', 'routes_id')
            ->withTimestamps();
    }

    public function myEquipment()
    {
        return $this->hasMany(MyEquipment::class, 'users_id');
    }

    public function campsOpinions()
    {
        return $this->hasMany(CampsOpinion::class, 'users_id');
    }

    public function poiOpinions()
    {
        return $this->hasMany(PoiOpinion::class, 'users_id');
    }

    public function preferences()
    {
        return $this->hasMany(UsersPreference::class, 'users_id');
    }
}
