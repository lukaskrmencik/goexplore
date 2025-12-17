<?php

namespace App\Models\Camp;

use Illuminate\Database\Eloquent\Model;
use App\Models\Camp\Camp;

class CampService extends Model
{
    protected $table = 'camps_schema.services';

    public $timestamps = false;

    protected $fillable = [
        'name',
        'timestamp'
    ];

    public function camps()
    {
        return $this->belongsToMany(
            Camp::class,
            'camps_schema.camps_services',
            'service_id',
            'camp_id'
        )->withPivot('id', 'timestamp');
    }
}
