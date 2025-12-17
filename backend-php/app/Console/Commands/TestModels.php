<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User\User;
use App\Models\Route\Route;
use App\Models\Route\Waypoint;
use App\Models\Equipment\GeneralEquipment;
use App\Models\Equipment\MyEquipment;
use Clickbar\Magellan\Data\Geometries\Point;
use Clickbar\Magellan\Data\Geometries\LineString;

class TestModels extends Command
{
    protected $signature = 'test:models';
    protected $description = 'Test CRUD operací u nových modelů';

    public function handle()
    {
        $this->info('=== Test User ===');
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password_hash' => 'hash',
            'location' => Point::makeGeodetic(50.1, 14.4)
        ]);
        $this->info('User created: '.$user->id);

        $this->info('=== Test Route ===');
        $route = Route::create([
            'users_id' => $user->id,
            'mode' => 'simple',
            'start' => Point::makeGeodetic(50.1, 14.4),
            'end' => Point::makeGeodetic(50.2, 14.5),
            'route' => LineString::make([
                Point::makeGeodetic(50.1, 14.4),
                Point::makeGeodetic(50.2, 14.5)
            ])
        ]);
        $this->info('Route created: '.$route->id);

        $this->info('=== Test Waypoint ===');
        $waypoint = Waypoint::create([
            'routes_id' => $route->id,
            'coordinates' => Point::makeGeodetic(50.15, 14.45)
        ]);
        $this->info('Waypoint created: '.$waypoint->id);

        $this->info('=== Test GeneralEquipment ===');
        $eq = GeneralEquipment::create([
            'name' => 'Tent',
            'img_id' => 'img123',
            'specifications_keys' => json_encode(['weight','color'])
        ]);
        $this->info('GeneralEquipment created: '.$eq->id);

        $this->info('=== Test MyEquipment ===');
        $myEq = MyEquipment::create([
            'general_equipment_id' => $eq->id,
            'img_id' => 'img_my_001',
            'specifications' => json_encode(['weight' => '2kg','color' => 'green'])
        ]);
        $this->info('MyEquipment created: '.$myEq->id);

        $this->info('✅ Vsechny testy probehly uspesne');
    }
}
