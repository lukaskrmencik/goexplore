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

        //inherit image from general equipment
        $generalEquipment = GeneralEquipment::find($request->general_equipment_id);
        $imagePath = $generalEquipment ? $generalEquipment->img : null;

        //create
        $myEquipment = MyEquipment::create([
            'users_id' => $userId,
            'name' => $request->name,
            'specifications' => $request->specifications,
            'general_equipment_id' => $request->general_equipment_id,
            'img' => $imagePath,
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
        $query = $user->myEquipment()->with('generalEquipment')->orderBy('created_at', 'desc');

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

    //upload image
    public function uploadImage(Request $request, $id)
    {
        //find record
        $myEquipment = MyEquipment::findOrFail($id);

        //authorization
        $this->authorize('update', $myEquipment);

        //validate image
        $request->validate([
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('image')) {
            //store file
            $path = $request->file('image')->store('equipment_images', 'public');

            //update record
            $myEquipment->img = $path;
            $myEquipment->save();

            //response
            return response()->success(['path' => $path], 200);
        }

        return response()->success(['message' => 'Nebyl nahrán žádný obrázek'], 200);
    }

    //delete my equipment
    public function deleteMyEquipment(Request $request, $id)
    {
        //find record
        $myEquipment = MyEquipment::findOrFail($id);

        //authorize
        $this->authorize('delete', $myEquipment);

        //detach from routes
        $myEquipment->routes()->detach();

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
                return 'Chybějící požadovaná specifikace '.$key;
                continue;
            }

            //set value
            $value = $specs[$key];

            //switch for checking correct data type of value
            switch ($type) {
                case 'integer':
                    if (!is_int($value)) {
                        return 'Neplatné specifikace '.$key.' musí být celé číslo';
                    }
                    break;
                case 'numeric':
                    if (!is_numeric($value)) {
                        return 'Neplatné specifikace '.$key.' musí být číselné';
                    }
                    break;
                case 'string':
                    if (!is_string($value)) {
                        return 'Neplatné specifikace '.$key.' musí být řetězec';
                    }
                    break;
                case 'boolean':
                    if (!is_bool($value)) {
                        return 'Neplatné specifikace '.$key.' musí být boolean';
                    }
                    break;
                default:
                    return 'Neplatné specifikace neznámý datový typ';
            }
        }

        //if unknown keys provided
        $unknownKeys = array_diff(array_keys($specs), array_keys($specificationsKeys));
        if (!empty($unknownKeys)) {
            foreach ($unknownKeys as $key) {
                return 'Neplatná specifikace neznámý klíč '.$key;
            }
        }

        //if correct true
        return true;
    }
}
