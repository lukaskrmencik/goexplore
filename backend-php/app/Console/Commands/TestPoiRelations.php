<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Poi\Poi;

class TestPoiRelations extends Command
{
    protected $signature = 'test:poi';
    protected $description = 'Otestuje načítání POI a jejich vztahů';

    public function handle()
    {
        $poi = Poi::with([
            'category',
            'labels',
            'tags',
            'openingHoursMonths.days'
        ])->first();

        if (!$poi) {
            $this->error('Nenalezen žádný POI');
            return;
        }

        $this->info("POI: {$poi->name} ({$poi->id})");

        // Kategorie
        if ($poi->category) {
            $this->info("Category: {$poi->category->name}");
        }

        // Labels
        $this->info("Labels:");
        foreach ($poi->labels as $label) {
            $this->line("- {$label->name} (pivot timestamp: {$label->pivot->timestamp})");
        }

        // Tags
        $this->info("Tags:");
        foreach ($poi->tags as $tag) {
            $this->line("- {$tag->name} (pivot timestamp: {$tag->pivot->timestamp})");
        }

        // Opening Hours
        $this->info("Opening Hours:");
        foreach ($poi->openingHoursMonths as $month) {
            $this->line("Month {$month->month_from} - {$month->month_to}");
            foreach ($month->days as $day) {
                $this->line("  Weekday {$day->weekday}: {$day->time_from} - {$day->time_to}");
            }
        }

        // Test vlastní funkce openingHoursFull()
        $this->info("Testing openingHoursFull():");
        $hoursFull = $poi->openingHoursFull();
        print_r($hoursFull);
    }
}
