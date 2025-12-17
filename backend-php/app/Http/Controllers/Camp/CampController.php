<?php

namespace App\Http\Controllers\Camp;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Camp\Camp;


class CampController extends Controller
{
    //single camp
    public function singleCamp(Request $request, $id)
    {
        //find record
        $camp = Camp::findOrFail($id);

        //make array
        $campArray = $camp->toArray();

        //add accomondation types to array
        $campArray['accommodation_types'] = $camp->accommodationTypes->makeHidden('pivot')->toArray();

        //add accomondation equipment to array
        $campArray['equipment'] = $camp->equipment->makeHidden('pivot')->toArray();

        //add accomondation services to array
        $campArray['service'] = $camp->services->makeHidden('pivot')->toArray();

        //response
        return response()->success([
            'camp' => $campArray,
        ], 201);
    }
}
