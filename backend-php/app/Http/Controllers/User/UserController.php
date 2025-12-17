<?php

namespace App\Http\Controllers\User;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use App\Models\User\User;
use App\Http\Controllers\Controller;

use Clickbar\Magellan\Data\Geometries\Point;

class UserController extends Controller
{
    use \Illuminate\Foundation\Auth\Access\AuthorizesRequests;

    //single user
    public function singleUser($id = null)
    {
        if($id){
            //if id provided - find record
            $user = User::findOrFail($id);
        }else{
            //else use auth user
            $user = Auth::user();
        }

        //authorize
        $this->authorize('view', $user);

        //response
        return response()->success(['user' => $user], 200);
    }

    //update user
    public function updateUser(Request $request)
    {
        //validate name
        $request->validate([
            'name' => 'string|max:255',
        ]);

        //get user
        $user = Auth::user();

        //update name
        $user->update($request->only(['name']));

        //response
        return response()->success([
            "user" => $user
        ], 200);
    }

    //delete user
    public function deleteUser(Request $request)
    {
        //get user
        $user = Auth::user();

        //invalidate token
        JWTAuth::invalidate(JWTAuth::getToken());

        //delete record
        $user->delete();

        //response
        return response()->success([], 200);
    }

    //upload user profile picture
    public function uploadProfilePicture(Request $request)
    {
        //validate image
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        //get user
        $user = Auth::user();

        //store file and save path
        $path = $request->file('image')->store('profile_images', 'public');

        //save patch to db
        $user->profile_picture = $path;
        $user->save();

        //response
        return response()->success(['path' => $path], 200);
    }

    //set user location
    public function setUserLocation(Request $request)
    {
        //validation
        $request->validate([
            //user location
            'location' => ['required', 'array'],
            'location.coordinates' => ['required', 'array', 'size:2'],
            'location.coordinates.0' => ['required', 'numeric'],
            'location.coordinates.1' => ['required', 'numeric'],
        ]);

        //get user
        $user = Auth::user();

        //make magellan point
        $location = Point::makeGeodetic(
            $request['location']['coordinates'][1],
            $request['location']['coordinates'][0]
        );

        //save location to db
        $user->location = $location;
        $user->save();

        //response
        return response()->success([
            "user" => $user
        ], 200);
    }

}
