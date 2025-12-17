<?php

namespace App\Models\Equipment;

use Illuminate\Database\Eloquent\Model;
use App\Models\User\User;
use App\Models\Route\Route;
use App\Models\Equipment\GeneralEquipment;

class MyEquipment extends Model
{
    protected $table = 'my_equipment';

    protected $fillable = [
        'users_id',
        "name",
        'img',
        'specifications',
        'general_equipment_id'
    ];

    protected $casts = [
        'specifications' => 'array',
    ];

    public function generalEquipment()
    {
        return $this->belongsTo(GeneralEquipment::class, 'general_equipment_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'users_id');
    }

    public function routes()
    {
        return $this->belongsToMany(Route::class, 'routes_equipment', 'my_equipment_id', 'routes_id')
            ->withTimestamps();
    }
}
