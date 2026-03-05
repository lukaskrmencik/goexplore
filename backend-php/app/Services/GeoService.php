<?php

namespace App\Services;

class GeoService
{
    //check if first and last point of axis match start and end point
    public static function startEndMatchAxis(array $startPoint, array $endPoint, array $axis): ?string
    {
        $firstAxisPoint = $axis[0];
        $lastAxisPoint = $axis[count($axis) - 1];

        if ($firstAxisPoint !== $startPoint) {
            return 'První souřadnice osy musí odpovídat počátečním souřadnicím.';
        }

        if ($lastAxisPoint !== $endPoint) {
            return 'Poslední souřadnice osy musí odpovídat koncovým souřadnicím.';
        }

        return null;
    }
}
