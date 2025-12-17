<?php

namespace App\Http\Controllers\Equipment;

use App\Models\Equipment\GeneralEquipment;
use App\Models\Equipment\MyEquipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Controller;

class MyEquipmentController extends Controller
{
    use \Illuminate\Foundation\Auth\Access\AuthorizesRequests;

    //create my equipment
    public function createMyEquipment(Request $request)
    {
        //get user id
        $userId = Auth::id();

        //validate
        $request->validate([
            //unique name (of users equipment)
            "name" => [
                'required',
                'string',
                'max:255',
                Rule::unique('my_equipment')
                    ->where(function ($query) use ($userId) {
                    $query->where('users_id', $userId);
                }),
            ],
            //specifications json
            'specifications' => 'required|array',
            //general equipment pattern
            'general_equipment_id' => 'required|integer|exists:general_equipment,id',
        ]);

        //validate specifications according to general equipment pattern
        $validateSpecifications = $this->validateSpecifications(
            $request->specifications, $request->general_equipment_id
        );

        //if false - error
        if($validateSpecifications !== true){
            return response()->error($validateSpecifications, 422);
        }

        //create
        $myEquipment = MyEquipment::create([
            'users_id' => $userId,
            'name' => $request->name,
            'specifications' => json_encode($request->specifications),
            'general_equipment_id' => $request->general_equipment_id,
        ]);

        //response
        return response()->success([
            'my_equipment' => $myEquipment,
        ], 201);
    }

    //single my equipment
    public function singleMyEquipment(Request $request, $id)
    {
        //find record
        $myEquipment = MyEquipment::findOrFail($id);

        //authorization
        $this->authorize('view', $myEquipment);

        //response
        return response()->success([
            'my_equipment' => $myEquipment,
        ], 201);
    }

    //my equipment list
    public function allMyEquipment(Request $request)
    {
        //validate
        $request->validate([
            "search" => 'string|max:255',
            'per_page' => 'integer|min:1',
        ]);

        //get user
        $user = auth()->user();

        //make query
        $query = $user->myEquipment();

        //search - if provided
        if ($request->filled('search')) {
            $query->where('name', 'ILIKE', "%{$request->input('search')}%");
        }

        //paginate
        $paginator = $query->paginate($request->input('per_page', 10));

        //response
        return response()->pagination($paginator);
    }

    //update my equipment
    public function updateMyEquipment(Request $request, $id)
    {
        //find record
        $myEquipment = MyEquipment::findOrFail($id);

        //authorization
        $this->authorize('update', $myEquipment);

        //get user id
        $userId = Auth::id();

        //validation
        $request->validate([
            //unique optional name (of users equipment)
            'name' => [
                'string',
                'max:255',
                Rule::unique('my_equipment')
                    ->ignore($myEquipment->id)
                    ->where(function ($query) use ($userId) {
                    $query->where('users_id', $userId);
                }),
            ],
            //specifications json
            'specifications' => 'array',
        ]);

        //if specifications provided - validate according to general equipment pattern
        if(isset($request->specifications)){
            $validateSpecifications = $this->validateSpecifications(
                $request->specifications,
                $myEquipment->general_equipment_id
            );

            //if false - error
            if($validateSpecifications !== true){
                return response()->error($validateSpecifications, 422);
            }
        }

        //update
        $myEquipment->update($request->only(['name', 'specifications']));

        //response
        return response()->success([
            'my_equipment' => $myEquipment,
        ], 201);
    }

    //delete my equipment
    public function deleteMyEquipment(Request $request, $id)
    {
        //find record
        $myEquipment = MyEquipment::findOrFail($id);

        //authorize
        $this->authorize('delete', $myEquipment);

        //delete
        $myEquipment->delete();

        //response
        return response()->success([], 201);
    }

    //function for validating specifications
    private function validateSpecifications($specs, $generalEquipmentId)
    {
        //find general equipment record
        $generalEquipment = GeneralEquipment::findOrFail($generalEquipmentId);

        //get specification keys
        $specificationsKeys = $generalEquipment->specifications_keys;

        //go through the specification keys using foreach
        foreach ($specificationsKeys as $key => $type) {

            //if missing some specification
            if (!isset($specs[$key])) {
                return 'Missing required specification '.$key;
                continue;
            }

            //set value
            $value = $specs[$key];

            //switch for checking correct data type of value
            switch ($type) {
                case 'integer':
                    if (!is_int($value)) {
                        return 'Invalid specifications '.$key.' must be integer';
                    }
                    break;
                case 'numeric':
                    if (!is_numeric($value)) {
                        return 'Invalid specifications '.$key.' must be numeric';
                    }
                    break;
                case 'string':
                    if (!is_string($value)) {
                        return 'Invalid specifications '.$key.' must be string';
                    }
                    break;
                case 'boolean':
                    if (!is_bool($value)) {
                        return 'Invalid specifications '.$key.' must be boolean';
                    }
                    break;
                default:
                    return 'Invalid specifications  unknown data type';
            }
        }

        //if unknown keys provided
        $unknownKeys = array_diff(array_keys($specs), array_keys($specificationsKeys));
        if (!empty($unknownKeys)) {
            foreach ($unknownKeys as $key) {
                return 'Invalid specification unknown key '.$key;
            }
        }

        //if correct true
        return true;
    }
}
