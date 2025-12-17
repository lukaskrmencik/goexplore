<?php

namespace App\Models\Route;

use Illuminate\Database\Eloquent\Model;
use App\Models\Equipment\GeneralEquipment;
use App\Models\Equipment\MyEquipment;
use App\Models\Route\Route;

class RouteEquipment extends Model
{
    protected $table = 'routes_equipment';

    protected $fillable = [
        'routes_id',
        'general_equipment_id',
        'my_equipment_id',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class, 'routes_id');
    }

    public function generalEquipment()
    {
        return $this->belongsTo(GeneralEquipment::class, 'general_equipment_id');
    }

    public function myEquipment()
    {
        return $this->belongsTo(MyEquipment::class, 'my_equipment_id');
    }
}
