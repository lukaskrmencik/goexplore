<?php

namespace App\Models\Camp;

use Illuminate\Database\Eloquent\Model;
use App\Models\Camp\Camp;

class CampEquipment extends Model
{
    protected $table = 'camps_schema.equipment';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'timestamp'
    ];

    public function camps()
    {
        return $this->belongsToMany(
            Camp::class,
            'camps_schema.camps_equipment',
            'equipment_id',
            'camp_id'
        )->withPivot('id', 'timestamp');
    }
}
