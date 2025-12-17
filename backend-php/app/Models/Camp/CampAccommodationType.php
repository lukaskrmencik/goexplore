<?php

namespace App\Models\Camp;

use Illuminate\Database\Eloquent\Model;
use App\Models\Camp\Camp;

class CampAccommodationType extends Model
{
    protected $table = 'camps_schema.accommodation_types';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'timestamp'
    ];

    public function camps()
    {
        return $this->belongsToMany(
            Camp::class,
            'camps_schema.camp_accommodation_types',
            'accommodation_type_id',
            'camp_id'
        )->withPivot('id', 'timestamp');
    }
}
