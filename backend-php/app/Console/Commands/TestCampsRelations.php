<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Camp\Camp;

class TestCampsRelations extends Command
{
    protected $signature = 'test:camps';
    protected $description = 'Otestuje načítání Camp a jeho vztahů';

    public function handle()
    {
        $camp = Camp::with(['accommodationTypes', 'equipment', 'services'])->first();

        if (!$camp) {
            $this->error('Nenalezen žádný Camp');
            return;
        }

        $this->info("Camp: {$camp->name} ({$camp->id})");

        // Accommodation Types
        $this->info("Accommodation Types:");
        foreach ($camp->accommodationTypes as $type) {
            $this->line("- {$type->name} (pivot timestamp: {$type->pivot->timestamp})");
        }

        // Equipment
        $this->info("Equipment:");
        foreach ($camp->equipment as $eq) {
            $this->line("- {$eq->name} (pivot timestamp: {$eq->pivot->timestamp})");
        }

        // Services
        $this->info("Services:");
        foreach ($camp->services as $service) {
            $this->line("- {$service->name} (pivot timestamp: {$service->pivot->timestamp})");
        }
    }
}
