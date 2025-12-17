<?php

namespace App\Services;

use Carbon\Carbon;

class CalculateRouteService
{
    public function calculateDays($route)
    {
        $dayStart = Carbon::createFromFormat('H:i', env('DAY_START'))->setDate(1970, 1, 1);
        $dayEnd = Carbon::createFromFormat('H:i', env('DAY_END'))->setDate(1970, 1, 1);

        $startDate = Carbon::parse($route->start_date);
        $endDate = Carbon::parse($route->end_date);

        $startTime = $startDate->copy()->setDate(1970, 1, 1);
        $endTime = $endDate->copy()->setDate(1970, 1, 1);

        $current = $startDate->copy()->startOfDay();

        $daysList = [];

        while ($current->lte($endDate->copy()->startOfDay())) {

            $currentDayStart = $dayStart->copy();
            $currentDayEnd = $dayEnd->copy();

            if($current->eq($startDate->copy()->startOfDay())){

                if($startTime->gt($dayEnd)){
                    $current->addDay();
                    continue;
                }else if(!$startTime->lt($dayStart)){
                    $currentDayStart = $startTime->copy();
                }

            }else if($current->eq($endDate->copy()->startOfDay())){

                if($endTime->lt($dayStart)){
                    $current->addDay();
                    continue;
                }else if(!$endTime->gt($dayEnd)){
                    $currentDayEnd = $endTime;

                }
            }

            $dayStartDate = $current->copy()
                ->setHour($currentDayStart->hour)
                ->setMinute($currentDayStart->minute)
                ->setSecond($currentDayStart->second);

            $dayEndDate = $current->copy()
                ->setHour($currentDayEnd->hour)
                ->setMinute($currentDayEnd->minute)
                ->setSecond($currentDayEnd->second);


            $dayLength = $dayStartDate->diffInHours($dayEndDate);
            $fullDayLength = $dayStart->diffInHours($dayEnd);
            $percentOfFull = $dayLength / $fullDayLength;


            $daysList[] = [
                "startDatetime" => $dayStartDate,
                "endDatetime" => $dayEndDate,
                "dayLength" => $dayLength,
                "timePercentOfFull" => $percentOfFull,
            ];

            $current->addDay();
        }

        return $daysList;
    }
}

