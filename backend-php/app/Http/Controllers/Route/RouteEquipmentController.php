<?php

namespace App\Http\Controllers\Route;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use App\Enums\EquipmentTypes;
use App\Models\Route\Route;
use App\Models\Route\RouteEquipment;
use App\Models\Equipment\MyEquipment;
use App\Models\Equipment\GeneralEquipment;

class RouteEquipmentController extends Controller
{
    use \Illuminate\Foundation\Auth\Access\AuthorizesRequests;

    //add equipment
    public function addEquipment(Request $request, $routeId)
    {
        //validate enum type and int id
        $request->validate([
            "type" => [
                'required',
                'string',
                Rule::enum(EquipmentTypes::class),
            ],
            'equipment_id' => 'integer',
        ]);

        $route = Route::findOrFail($routeId);
        $equipmentId = $request["equipment_id"];

        //autorization
        $routeEquipmentObject = new RouteEquipment([
            'routes_id' => $route->id
        ]);
        $this->authorize('create', $routeEquipmentObject);

        //defines default nulls
        $generalEquipment = null;
        $myEquipment = null;

        //ifs for equipment types
        //general equipment
        if($request["type"] == "general"){

            //no duplicate values
            $exists = RouteEquipment::where('routes_id', $route->id)
                ->where('general_equipment_id', $equipmentId)
                ->exists();

            //error if duplicate
            if ($exists) {
                return response()->error("This equipment is already assigned to the route.", 422);
            }

            //else define
            $generalEquipment = GeneralEquipment::findOrFail($equipmentId);

        //my equipment
        }else if($request["type"] == "my"){

            //no duplicate values
            $exists = RouteEquipment::where('routes_id', $route->id)
                ->where('my_equipment_id', $equipmentId)
                ->exists();

            //error if duplicate
            if ($exists) {
                return response()->error("This equipment is already assigned to the route.", 422);
            }

            //else define
            $myEquipment = MyEquipment::findOrFail($equipmentId);

            //equipment must be owned by the route owner or a user assigned to the route
            if($myEquipment->users_id !== $route->users_id && !$route->users->pluck('id')->contains($myEquipment->users_id)){
                return response()->error("You can only add equipment that you or your friends own.", 403);
            }
        }

        //create in pivot table
        $routeEquipment = RouteEquipment::create([
            'routes_id' => $routeId,
            'general_equipment_id' => $generalEquipment?->id,
            'my_equipment_id' => $myEquipment?->id,
        ]);

        //response
        return response()->success([
            'routeEquipment' => $routeEquipment,
        ], 201);
    }


    //delete equipment
    public function removeEquipment(Request $request, $routeId)
    {
        //validate enum type and int id
        $request->validate([
            "type" => [
                'required',
                'string',
                Rule::enum(EquipmentTypes::class),
            ],
            'equipment_id' => 'integer',
        ]);

        $route = Route::findOrFail($routeId);
        $equipmentId = $request["equipment_id"];


        //ifs for equipment types
        //general equipment
        if($request["type"] == "general"){

            //find record
            $routeEquipmentObject = RouteEquipment::where('routes_id', $route->id)
                ->where('general_equipment_id', $equipmentId)
                ->firstOrFail();

        //my equipment
        }else if($request["type"] == "my"){

            //find record
            $routeEquipmentObject = RouteEquipment::where('routes_id', $route->id)
                ->where('my_equipment_id', $equipmentId)
                ->firstOrFail();
        }

        //autorization
        $this->authorize('delete', $routeEquipmentObject);

        //delete
        $routeEquipmentObject->delete();

        //response
        return response()->success([], 201);
    }
}
