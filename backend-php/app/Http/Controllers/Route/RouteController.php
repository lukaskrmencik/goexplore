<?php

namespace App\Http\Controllers\Route;

use Carbon\Carbon;
use App\Models\Poi\Poi;
use App\Enums\RouteMode;
use App\Models\Camp\Camp;
use App\Helpers\JobHelper;
use App\Models\Route\Route;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use App\Services\GeoService;
use Illuminate\Http\Request;
use App\Enums\EquipmentTypes;
use App\Jobs\CalculateRouteJob;
use Illuminate\Validation\Rule;
use App\Models\Route\RouteCluster;
use Illuminate\Support\Facades\DB;
use Clickbar\Magellan\Enums\EndCap;
use App\Http\Controllers\Controller;
use App\Models\Route\RouteEquipment;
use Illuminate\Support\Facades\Auth;

use Illuminate\Support\Facades\Http;
use App\Models\Equipment\MyEquipment;
use App\Services\CalculateRouteService;
use App\Models\Equipment\GeneralEquipment;
use Clickbar\Magellan\Data\Geometries\Point;
use Clickbar\Magellan\Data\Geometries\LineString;
use Clickbar\Magellan\Database\PostgisFunctions\ST;
use Clickbar\Magellan\IO\Generator\WKT\WKTGenerator;
use Clickbar\Magellan\Database\Expressions\AsGeography;



class RouteController extends Controller
{
    use \Illuminate\Foundation\Auth\Access\AuthorizesRequests;

    //create
    public function createRoute(Request $request)
    {
        $userId = Auth::id();

        //validate
        $request->validate([
            //unique name
            "name" => [
                'string',
                'max:255',
                Rule::unique('routes')
                    ->where(function ($query) use ($userId) {
                    $query->where('users_id', $userId);
                }),
            ],
            //enum mode
            "mode" => [
                'required',
                'string',
                Rule::enum(RouteMode::class),
            ],
        ]);

        //count of routes of user for name
        $routesCount = auth()->user()->routes()->count() + 1;

        //name (if not in request uses default name + count)
        $name = $request->input('name') ?? config('my.route_default_name')." ".$routesCount;

        //create
        $route = Route::create([
            'users_id' => Auth::id(),
            'name' => $name,
            "mode" => $request->mode,
            'buffer_size' => env('DEFAULT_BUFFER_SIZE'),
        ]);

        //ressponse
        return response()->success([
            'route' => $route,
        ], 201);
    }


    public function updateRoute(Request $request, $id)
    {
        //find route
        $route = Route::findOrFail($id);

        //get user id
        $userId = auth()->id();

        //validate
        $request->validate([
            //unique name
            "name" => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('routes')
                    ->ignore($route->id)
                    ->where(function ($query) use ($userId) {
                        $query->where('users_id', $userId);
                    }),
            ],

            //start coordinates approximately in czech
            'start' => ['sometimes', 'array'],
            'start.coordinates' => ['sometimes', 'array', 'size:2'],
            'start.coordinates.0' => ['required_with:start.coordinates', 'numeric', 'between:12.09,18.86'],
            'start.coordinates.1' => ['required_with:start.coordinates', 'numeric', 'between:48.55,51.06'],

            //end coordinates approximately in czech
            'end' => ['sometimes', 'array'],
            'end.coordinates' => ['sometimes', 'array', 'size:2'],
            'end.coordinates.0' => ['required_with:end.coordinates', 'numeric', 'between:12.09,18.86'],
            'end.coordinates.1' => ['required_with:end.coordinates', 'numeric', 'between:48.55,51.06'],

            //ISO 8601 dates in future
            'start_date' => [
                'sometimes',
                'date',
                'date_format:Y-m-d\TH:i:s\Z',
                'after:now',
            ],
            'end_date' => [
                'sometimes',
                'date',
                'date_format:Y-m-d\TH:i:s\Z',
                'after:start_date',
            ],

            //route axis geojson
            'axis' => ['sometimes', 'array'],
            'axis.coordinates' => ['sometimes', 'array', 'min:2'],
            'axis.coordinates.*' => ['array', 'size:2'],
            'axis.coordinates.*.0' => ['required_with:axis.coordinates', 'numeric'],
            'axis.coordinates.*.1' => ['required_with:axis.coordinates', 'numeric'],

            //buffer size number (km around linestring for choosing camps and poi)
            'buffer_size' => ['sometimes', 'numeric', 'min:5', 'max:100'],

            //target route length per day in km
            'max_route_length_day' => ['sometimes', 'numeric', 'min:1', 'max:1000'],

            //Number of poi visited per day
            'poi_per_day' => ['sometimes', 'numeric', 'min:1', 'max:1000']
        ]);

        //validation that the end_date is at least 3 hours after the start_date
        $startDate = Carbon::parse($request['start_date']);
        $endDate = Carbon::parse($request['end_date']);

        if ($startDate->diffInHours($endDate) < 3) {
            return response()->error("End_date must be at least 3 hours after the start_date.", 422);
        }

        //Transform start point data to magellan (if privoded)
        $startPoint = $route->start;
        if ($request->filled('start.coordinates')) {
            $startPoint = Point::makeGeodetic(
                $request['start']['coordinates'][1],
                $request['start']['coordinates'][0]
            );
        }

        //Transform end point data to magellan (if privoded)
        $endPoint = $route->end;
        if ($request->filled('end.coordinates')) {
            $endPoint = Point::makeGeodetic(
                $request['end']['coordinates'][1],
                $request['end']['coordinates'][0]
            );
        }

        //work with route axis if provided
        $axisLineString = $route->axis;
        if ($request->filled('axis.coordinates')) {

            //check if first and last point of axis match start and end point
            if(($startPoint != null && $endPoint != null) ||
            ($request->filled('start.coordinates') && $request->filled('end.coordinates'))){

                $error = GeoService::startEndMatchAxis(
                    $request['start']['coordinates'] ?? [$route->start->getLongitude(), $route->start->getLatitude()],
                    $request['end']['coordinates'] ?? [$route->end->getLongitude(), $route->end->getLatitude()],
                    $request['axis']['coordinates'],
                );
                if ($error) {
                    return response()->error(['axis' => $error], 422);
                }

                //make magellan linestring
                $axisLineString = LineString::make(
                    array_map(fn($coord) => Point::makeGeodetic($coord[1], $coord[0]), $request["axis"]["coordinates"])
                );

            }else{
                return response()->error(
                    "if you want to define an axis you must first define the start and end of the route", 422
                );
            }
        }

        //authorize
        $this->authorize('update', $route);

        //update data what user send
        $route->update(array_filter([
            'name' => $request['name'] ?? null,
            'start' => $startPoint ?? null,
            'end' => $endPoint ?? null,
            'start_date' => $request['start_date'] ?? null,
            'end_date' => $request['end_date'] ?? null,
            'axis' => $axisLineString ?? null,
            'buffer_size' => $request["buffer_size"] ?? null,
            'max_route_length_day' => $request["max_route_length_day"] ?? null,
            'poi_per_day' => $request["poi_per_day"] ?? null
        ]));

        //response
        return response()->success([
            'route' => $route,
        ], 201);
    }


    //single
    public function singleRoute(Request $request, $id)
    {
        $route = Route::findOrFail($id);

        //authorize
        $this->authorize('view', $route);

        $routeArray = $route->toArray();

        //add camps to array
        $routeArray['camps'] = $route->camps->map(function($camp) {
            return [
                'id' => $camp->id,
                'name' => $camp->name,
                'image_url' => $camp->image_url,
                'location' => $camp->geom,
                'order' => $camp->pivot->order,
            ];
        });

        //add poi to array
        $routeArray['poi'] = collect();

        $grouped_poi = $route->poi->groupBy(fn ($poi) => $poi->pivot->routes_clusters_id);

        foreach ($grouped_poi as $clusterId => $pois) {

            if ($clusterId === '') {
                foreach ($pois as $poi) {
                    $routeArray['poi']->push([
                        'type' => 'single',
                        'order' => $poi->pivot->order,
                        'poi_data' => [
                            [
                                'id' => $poi->id,
                                'name' => $poi->name,
                                'image_url' => $poi->image_url,
                                'location' => $poi->geom,
                            ]
                        ],
                    ]);
                }
            }else{
                $clusterId = intval($clusterId);

                $cluster = RouteCluster::findOrFail($clusterId);

                $clusterPois = $pois->map(function ($poi) {
                    return [
                        'id' => $poi->id,
                        'name' => $poi->name,
                        'image_url' => $poi->image_url,
                        'location' => $poi->geom,
                    ];
                })->values();

                $routeArray['poi']->push([
                    'type' => 'cluster',
                    'cluster' => [
                        'id' => $cluster->id,
                        'name' => $cluster->name,
                        'location' => $cluster->geom,
                        'best_poi_id' => $cluster->best_poi_id,
                    ], 
                    'order' => $pois->first()->pivot->order,
                    'poi_data' => $clusterPois
                ]);
            }
        }

        $routeArray['poi'] = $routeArray['poi']
            ->sortBy('order')
            ->values();

        //add general equipment to array
        $routeArray['generalEquipment'] = $route->generalEquipment->map(function($generalEquipment) {
            return [
                'id' => $generalEquipment->id,
                'name' => $generalEquipment->name,
                'img' => $generalEquipment->img,
                'specifications' => $generalEquipment->general_specifications
            ];
        });

        //add general my to array
        $routeArray['myEquipment'] = $route->myEquipment->map(function($myEquipment) {
            return [
                'id' => $myEquipment->id,
                'name' => $myEquipment->name,
                'img' => $myEquipment->img,
                'specifications' => $myEquipment->specifications
            ];
        });

        //add waypoints to array
        $routeArray['waypoints'] = $route->waypoints;

        //response
        return response()->success([
            'route' => $routeArray,
        ], 201);
    }


    //all (of user)
    public function allRoutes(Request $request)
    {
        //validate search and per page
        $request->validate([
            "search" => 'string|max:255',
            'per_page' => 'integer|min:1',
        ]);

        $user = auth()->user();

        //building query with
        $query = $user->routes()->select(['id', 'name', 'mode', 'start_date', 'end_date']);

        //search (if provided)
        if ($request->filled('search')) {
            $query->where('name', 'ILIKE', "%{$request->input('search')}%");
        }

        //paginate
        $paginator = $query->paginate($request->input('per_page', 10));

        //paginated response
        return response()->pagination($paginator);
    }


    //delete route
    public function deleteRoute(Request $request, $id)
    {
        $route = Route::findOrFail($id);

        $this->authorize('delete', $route);

        //delete linked records
        $route->camps()->detach();
        $route->poi()->detach();
        $route->myEquipment()->detach();
        $route->generalEquipment()->detach();

        //delete child records
        $route->waypoints()->delete();
        $route->equipment()->delete();

        //delete route record
        $route->delete();
        return response()->success([], 201);
    }

    //shared routes (for user)
    public function sharedRoutes(Request $request)
    {
        //validate search and per page
        $request->validate([
            "search" => 'string|max:255',
            'per_page' => 'integer|min:1',
        ]);

        $user = auth()->user();

        //building query with
        $query = $user->sharedRoutes()->select([
            'routes.id', 'routes.name', 'routes.mode',"routes.users_id", 'routes.start_date', 'routes.end_date'
        ]);

        //search (if provided)
        if ($request->filled('search')) {
            $query->where('name', 'ILIKE', "%{$request->input('search')}%");
        }

        //paginate
        $paginator = $query->paginate($request->input('per_page', 10));

        //paginated response
        return response()->pagination($paginator);
    }

    public function calculateRoute(Request $request, $id, CalculateRouteService $calculateRouteService){

        $route = Route::findOrFail($id);

        $this->authorize('update', $route);

        $jobId = Str::uuid()->toString();
        
        JobHelper::setJobRouteId($jobId, $route->id);

        CalculateRouteJob::dispatch($id, $jobId, $calculateRouteService);

        return response()->success(['job_id' => $jobId],201);
    }

    public function calculateRouteJobProgress(Request $request, $jobId){

        $userId = auth()->id();

        $routeId = JobHelper::getJobRouteId($jobId);
        $route = Route::findOrFail($routeId);

        $this->authorize('view', $route);

        $jobProgress = JobHelper::getJobProgress($jobId);

        return response()->success($jobProgress, 201);
    }
}



