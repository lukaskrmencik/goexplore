<?php

namespace App\Http\Controllers\Route;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use App\Models\Route\Waypoint;

use Clickbar\Magellan\Data\Geometries\Point;

class WaypointController extends Controller
{
    use \Illuminate\Foundation\Auth\Access\AuthorizesRequests;

    public function createWaypoint(Request $request, $routeId)
    {
        //validate
        $request->validate([
            //location approximately in czech
            'location' => ['required', 'array'],
            'location.coordinates' => ['required', 'array', 'size:2'],
            'location.coordinates.0' => ['required', 'numeric', 'between:12.09,18.86'],
            'location.coordinates.1' => ['required', 'numeric', 'between:48.55,51.06'],

            //unique order (for route)
            'order' => [
                'required',
                'integer',
                Rule::unique('waypoints', 'order')
                    ->where(function ($query) use ($routeId) {
                        return $query->where('routes_id', $routeId);
                }),
            ],
        ]);

        //make magellan point
        $location = Point::makeGeodetic(
            $request['location']['coordinates'][1],
            $request['location']['coordinates'][0]
        );

        //define waypoint object
        $waypoint = new Waypoint([
            'routes_id' => $routeId,
            'order' => $request->order,
            'coordinates' => $location
        ]);

        //authorize
        $this->authorize('create', $waypoint);

        //save to db
        $waypoint->save();

        $waypoint->makeHidden('route');

        //response
        return response()->success([
            'waypoint' => $waypoint,
        ], 201);
    }

    public function updateWaypoint(Request $request, $id)
    {
        //find record
        $waypoint = Waypoint::findOrFail($id);

        //authorize
        $this->authorize('update', $waypoint);

        //validate
        $request->validate([
            //optional location approximately in czech
            'location' => ['sometimes', 'array'],
            'location.coordinates' => ['required_with:location', 'array', 'size:2'],
            'location.coordinates.0' => ['required_with:location', 'numeric', 'between:12.09,18.86'],
            'location.coordinates.1' => ['required_with:location', 'numeric', 'between:48.55,51.06'],

            //optional unique order
            'order' => ['sometimes','integer']
        ]);

        //set coordinates if provided
        if ($request->filled('location')) {
            $waypoint->coordinates = Point::makeGeodetic(
                $request['location']['coordinates'][1],
                $request['location']['coordinates'][0]
            );
        }

        //set order if provided
        if ($request->filled('order')) {

            //if waypoint with order exist
            $existingItem = Waypoint::where('routes_id', $waypoint->routes_id)
                ->where('order', $request->order)
                ->first();

            //swap orders
            if ($existingItem) {
                $existingItem->order = $waypoint->order;
                $existingItem->save();
            }

            //set order
            $waypoint->order = $request->order;
        }

        //save to db
        $waypoint->save();

        $waypoint->makeHidden('route');

        //response
        return response()->success([
            'waypoint' => $waypoint,
        ], 200);
    }

    public function deleteWaypoint(Request $request, $id)
    {
        //find record
        $waypoint = Waypoint::findOrFail($id);

        //authorize
        $this->authorize('delete', $waypoint);

        //delete
        $waypoint->delete();

        //response
        return response()->success([], 200);
    }

}
