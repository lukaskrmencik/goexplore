<?php

namespace App\Jobs;

use Throwable;
use Carbon\Carbon;

use App\Models\Poi\Poi;
use App\Models\Camp\Camp;
use App\Helpers\JobHelper;
use App\Models\Route\Route;
use Illuminate\Support\Arr;
use App\Models\Route\RoutePoi;
use App\Models\Route\RouteCamp;
use App\Models\Route\RouteCluster;
use Clickbar\Magellan\Enums\EndCap;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Services\CalculateRouteService;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Clickbar\Magellan\Data\Geometries\Point;
use Clickbar\Magellan\Data\Geometries\LineString;
use Clickbar\Magellan\Database\PostgisFunctions\ST;

class CalculateRouteJob implements ShouldQueue
{
    use Queueable;

    protected $jobId;
    protected $routeId;
    protected $calculateRouteService;

    public function __construct($routeId, $jobId, CalculateRouteService $calculateRouteService)
    {
        $this->routeId = $routeId;
        $this->jobId = $jobId;
        $this->calculateRouteService = $calculateRouteService;
    }

    public function handle(): void
    {
        try {

            JobHelper::setJobProgress($this->jobId, 0, "running");

            //get route
            $route = Route::findOrFail($this->routeId);

            //chech if all data provided
            $exists = Route::query()
                ->whereNotNull('axis')
                ->whereNotNull('buffer_size')
                ->whereNotNull('start_date')
                ->whereNotNull('end_date')
                ->whereNotNull('start')
                ->whereNotNull('end')
                ->whereNotNull('max_route_length_day')
                ->whereNotNull('poi_per_day')
                ->exists(); 

            //if not exist - error
            if(!$exists){
                //return response()->error("Not all data was provided", 422);
            }

            //get all general equipment of route
            $equipment = $route->allGeneralEquipment();

            //get accomondation types what general equipment require
            $equipmentNeedCampAccomondationType = config('equipmentNeedCampAccomondationType');

            //make required accomondation types array
            $accomondationTypesNeeded = [];

            foreach($equipment as $singleEquipment){
                //check if equipment need some accomondation type
                $accomondationTypeId = Arr::get($equipmentNeedCampAccomondationType, $singleEquipment->id, false);
                //if yes
                if ($accomondationTypeId != false) {
                    //add to array
                    $accomondationTypesNeeded[] = $accomondationTypeId;
                }
            }

            //get days data fron calculate days service
            $days = $this->calculateRouteService->calculateDays($route);

            //set route axis
            $routeAxis = $route->axis;

            //set buffer size (space around axis) from km to m
            $routeBufferSize = $route->buffer_size * 1000;

            //create buffer with flat edges
            $bufferedLine = ST::buffer(
                //transform route axis to UTM zone
                ST::transform($routeAxis, env("UTM_ZONE")),
                //set buffer size
                $routeBufferSize,
                null,
                null,
                //flat edges
                EndCap::Flat
            );

            //get camps in buffer
            $camps = Camp::query()
                ->where(
                    ST::within(
                        //transform geom column to UTM zone
                        ST::transform('geom', env("UTM_ZONE")),
                        //provide buffer
                        $bufferedLine
                    ),
                    true
                )
                //only camps what have all accomondation types from array
                ->whereHas('accommodationTypes', function($query) use ($accomondationTypesNeeded) {
                    $query->whereIn('accommodation_type_id', $accomondationTypesNeeded);
                }, '=', count($accomondationTypesNeeded))
                ->get();

            //load scoring config and capm seazon config
            $campScores = config('scoringConfig.camps');
            $DEFAULT_CAMP_SEASON = config('defaultCampSeason');

            JobHelper::setJobProgress($this->jobId, 1, "running");

            //call python api endpoint to select camps
            $response = Http::post(env("PYTHON_API_URL").'/select-camps', [
                "camps" => $camps,
                "days" => $days,
                "axis" => $routeAxis,
                "scores" => $campScores,
                "DEFAULT_CAMP_SEASON" => $DEFAULT_CAMP_SEASON,
            ]);

            //if successful store result to variable
            if ($response->successful()) {
                $calculateCampsApiResult = $response->json();
            } else {
                //if not successful store status and error message
                $status = $response->status();
                $errorBody = $response->json();
                $errorMessage = $errorBody['detail'] ?? json_encode($errorBody);

                //set job progress to error with message
                JobHelper::setJobProgress($this->jobId, null, "Chyba", $errorMessage);

                return;
            }

            JobHelper::setJobProgress($this->jobId, 2, "running");

            $segmentsPoi = [];

            //loop throught axis segments
            foreach($calculateCampsApiResult['axis_segments'] as $i => $axisSegment){

                //make magellan linestring
                $segmentLineString = LineString::make(
                    array_map(fn($coord) => Point::makeGeodetic($coord[1], $coord[0]), $axisSegment["coordinates"])
                );

                //create buffer with flat edges
                $bufferedSegment = ST::buffer(
                    //transform route axis to UTM zone
                    ST::transform($segmentLineString, env("UTM_ZONE")),
                    //set buffer size
                    $routeBufferSize,
                    null,
                    null,
                    //flat edges
                    EndCap::Flat
                );

                //get poi in buffer
                $segmentPoi = Poi::query()
                    ->where(
                        ST::within(
                            //transform geom column to UTM zone
                            ST::transform('geom', env("UTM_ZONE")),
                            //provide buffer
                            $bufferedSegment
                        ),
                        true
                    )->get();

                //get segment start camp
                $segmentStart = $calculateCampsApiResult["selected_camps"][$i-1]["geom"] ?? null;
                //get segment end camp
                $segmentEnd = $calculateCampsApiResult["selected_camps"][$i]["geom"] ?? null;
                
                //if first segment start is route start
                if($i === 0){
                    $segmentStart = $route->start;
                    //if last segment end is route end
                }else if($i === count($calculateCampsApiResult['axis_segments']) - 1){
                    $segmentEnd = $route->end;
                }
                
                //add segment start end and pois to array
                $segmentsPoi[] = [
                    "start" => $segmentStart,
                    "end" => $segmentEnd,
                    "poi" => $segmentPoi
                ];
            }

            JobHelper::setJobProgress($this->jobId, 8, "running");

            //get poi scoring config and or tools config
            $poiScores = config('scoringConfig.poi');
            $orToolsConfig = config('ORToolsConfig');

            //make json from segmentsPoi array
            $json = json_encode($segmentsPoi);

            //get redis config
            $redis_config = [
                "host" => env("REDIS_HOST"),
                "port" => intval(env("REDIS_PORT")),
                "password" => env("REDIS_PASSWORD") === 'null' ? null : env("REDIS_PASSWORD"),
                "job_expires" => intval(env("REDIS_JOB_EXPIRES"))
            ];
            
            //call python api endpoint to select poi and calculate route
            $response = Http::post(env("PYTHON_API_URL").'/select-poi', [
                "segments_poi" => $segmentsPoi,
                "days" => $days,
                "scores" => $poiScores,
                "max_route_length_day" => $route->max_route_length_day,
                "poi_per_day" => $route->poi_per_day,
                "axis" => $routeAxis,
                "start_point" => $route->start,
                "end_point" => $route->end,
                "OSRM_SERVER_URL" => env("OSRM_SERVER_URL"),
                "PERCENTAGE_OF_CALC_POIS" => (float) env("PERCENTAGE_OF_CALC_POIS", 0.2),
                "MAX_NUMBER_OF_CALC_POIS" => (int) env("MAX_NUMBER_OF_CALC_POIS", 200),
                "OR_TOOLS_CONFIG" => $orToolsConfig,
                "CLUSTER_SIZE_KM" => env('CLUSTER_SIZE_KM'),
                "EARTH_RADIUS_KM" => env('EARTH_RADIUS_KM'),
                "REDIS_CONFIG" => $redis_config,
                "job_id" => $this->jobId
            ]);

            //if successful store result to variable
            if ($response->successful()) {
                $calculatePoiApiResult = $response->json();
            } else {
                //if not successful store status and error message
                $status = $response->status();
                $errorBody = $response->json();
                $errorMessage = $errorBody['detail'] ?? json_encode($errorBody);

                //set job progress to error with message
                JobHelper::setJobProgress($this->jobId, null, "Chyba", $errorMessage);

                return;
            }

            JobHelper::setJobProgress($this->jobId, 98, "running");

            //delete old route pois camps and clusters
            RoutePoi::where('routes_id', $route->id)->delete();
            RouteCamp::where('routes_id', $route->id)->delete();
            RouteCluster::where('routes_id', $route->id)->delete();

            //get selected poi ids from api result
            $segmenstsSelectedPoiIds = $calculatePoiApiResult["segments_selected_poi_ids"];

            $poiOrderCounter = 0;

            //loop throught segments
            foreach($segmenstsSelectedPoiIds as $selectedPoiIds){
                //loop throught selected poi ids
                foreach($selectedPoiIds as $poi){

                    //if poi is cluster
                    if($poi["type"] == "cluster"){

                        //generate cluster name
                        $clusterName = "cluster ".$poiOrderCounter;

                        //make magellan point
                        $geom = Point::makeGeodetic(
                            $poi["geom"]['coordinates'][1],
                            $poi["geom"]['coordinates'][0]
                        );

                        //create cluster in database
                        $cluster = RouteCluster::create([
                            'name' => $clusterName,
                            'geom' => $geom,
                            'best_poi_id' => $poi["best_poi_id"],
                            'routes_id' => $route->id,
                        ]);

                        //loop throught poi ids in cluster
                        foreach($poi["poi_ids"] as $poiId){

                            //male relation between route and poi with cluster id
                            $route->poi()->attach($poiId, [
                                'order' => $poiOrderCounter,
                                'routes_clusters_id' => $cluster->id
                            ]);
                        }

                    }else{
                        //if poi is not cluster make relation between route and poi
                        $route->poi()->attach($poi["poi_id"], [
                            'order' => $poiOrderCounter,
                            'routes_clusters_id' => null
                        ]);
                    }

                    $poiOrderCounter++;
                }
            }

            //get selected camp ids from api result
            $selectedCampsIds = $calculateCampsApiResult["selected_camps_ids"];

            $CampOrderCounter = 0;
            //loop throught selected camp ids
            foreach($selectedCampsIds as $campId){
                //make relation between route and camp
                $route->camps()->attach($campId, [
                    'order' => $CampOrderCounter
                ]);
                $CampOrderCounter++;
            }

            //get full route coordinates from api result
            $fullRouteCoords = $calculatePoiApiResult["full_route"]["coordinates"];

            //make magellan linestring
            $routeLineString = LineString::make(
                array_map(fn($coord) => Point::makeGeodetic($coord[1], $coord[0]), $fullRouteCoords)
            );

            //set complete route
            $route->complete_route = $routeLineString;

            //save changes to database
            $route->save();

            JobHelper::setJobProgress($this->jobId, 100, "done");

        } catch (Throwable $e) {
            //if any error set job progress to error with message
            JobHelper::setJobProgress($this->jobId, null, "Chyba", $e->getMessage());

            throw $e;
        }
    }
}