<?php

namespace App\Http\Controllers\Equipment;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Equipment\GeneralEquipment;

class GeneralEquipmentController extends Controller
{
    //single general equipment
    public function singleGeneralEquipment(Request $request, $id)
    {
        //find record
        $generalEquipment = GeneralEquipment::findOrFail($id);

        //response
        return response()->success([
            'my_equipment' => $generalEquipment,
        ], 201);
    }

    //general equipment list
    public function allGeneralEquipment(Request $request)
    {
        //validation
        $request->validate([
            "search" => 'string|max:255',
            'per_page' => 'integer|min:1',
        ]);

        //get user
        $user = auth()->user();

        //make query
        $query = GeneralEquipment::query();

        //if provided - search
        if ($request->filled('search')) {
            $query->where('name', 'ILIKE', "%{$request->input('search')}%");
        }

        //paginate
        $paginator = $query->paginate($request->input('per_page', 10));

        //response
        return response()->pagination($paginator);
    }
}
