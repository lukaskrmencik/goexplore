<?php

namespace App\Models\Equipment;

use Illuminate\Database\Eloquent\Model;
use App\Models\Equipment\MyEquipment;
use App\Models\Route\Route;

class GeneralEquipment extends Model
{
    protected $table = 'general_equipment';

    protected $fillable = [
        'name',
        'img',
        'specifications_keys',
        'general_specifications'
    ];

    protected $casts = [
        'specifications_keys' => 'array',
        'general_specifications' => 'array'
    ];

    public function myEquipment()
    {
        return $this->hasMany(MyEquipment::class, 'general_equipment_id');
    }

    public function routes()
    {
        return $this->belongsToMany(Route::class, 'routes_equipment', 'general_equipment_id', 'routes_id')
            ->withTimestamps();
    }
}
