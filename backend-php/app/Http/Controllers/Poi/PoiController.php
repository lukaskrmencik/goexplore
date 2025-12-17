<?php

namespace App\Http\Controllers\Poi;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Poi\Poi;

class PoiController extends Controller
{
    //single poi
    public function singlePoi(Request $request, $id)
    {
        //find record
        $poi = Poi::findOrFail($id);

        //make array
        $poiArray = $poi->toArray();

        //add categories to array
        $poiArray['category'] = $poi->category;

        //add labels to array
        $poiArray['labels'] = $poi->labels->makeHidden('pivot')->toArray();

        //add opening hours to array
        $poiArray['opening_hours'] = $poi->opening_hours_full;

        //add opening tags to array
        $poiArray['tags'] = $poi->tags->makeHidden('pivot')->toArray();

        //response
        return response()->success([
            'poi' => $poiArray,
        ], 201);
    }
}
