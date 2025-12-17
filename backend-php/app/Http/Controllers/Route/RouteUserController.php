<?php

namespace App\Http\Controllers\Route;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Route\RouteUser;
use App\Models\Route\Route;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Carbon\Carbon;

class RouteUserController extends Controller
{
    use \Illuminate\Foundation\Auth\Access\AuthorizesRequests;

    //generate new invite token for send
    public function inviteUser(Request $request, $routeId)
    {
        //auth user
        $userId = auth()->id();

        //find route and define new user id
        $route = Route::findOrFail($routeId);
        $newUserId = $request["user_id"];

        //generate token
        $token = Str::random(64);

        //get expires days from env
        $daysUntilExpire = (int) env('INVITE_EXPIRE_DAYS', 2);

        //set expires at
        $expiresAt = now()->addDays($daysUntilExpire);

        //define object
        $routeUser = new RouteUser([
            'routes_id' => $route->id,
            'invite_token' => $token,
            'expires_at' => $expiresAt
        ]);

        //authorize
        $this->authorize('create', $routeUser);

        //save to db
        $routeUser->save();

        //response
        return response()->success([
            'route' => $token,
        ], 201);
    }


    //accept invite with invite token
    public function acceptInvite(Request $request)
    {
        //auth user
        $userId = auth()->id();

        $request->validate([
            'token' => ['required', 'string'],
        ]);

        $token = $request["token"];

        //find record with token
        $routeUser = RouteUser::where('invite_token', $token)->firstOrFail();

        //if user already assigned - error
        $routeUserExists = RouteUser::where('users_id', $userId)
            ->where('routes_id', $routeUser->routes_id)
            ->first();

        if ($routeUserExists) {
            return response()->error('User is already assigned to this route', 422);
        }

        //authorize
        $this->authorize('invite', $routeUser);

        //set current date
        $now = Carbon::now();

        //check if token expired - error
        if ($routeUser->expires_at->lt($now)) {
            return response()->error("error expired", 401);
        }

        //save user to db and invalidate token
        $routeUser->users_id = auth()->id();
        $routeUser->invite_token = null;
        $routeUser->save();

        //response
        return response()->success([
            'route_id' => $routeUser->routes_id,
        ], 201);
    }

    //remove user (friend) from route
    public function removeUser(Request $request, $routeId)
    {
        //auth user
        $userId = auth()->id();

        //find route
        $route = Route::findOrFail($routeId);

        //validate
        $request->validate([
            'user_id' => [
                'required',
                'integer',
                //exist in users table
                'exists:users,id',
                //exists in routes_users table with route_id
                Rule::exists('routes_users', 'users_id')->where(function ($query) use ($routeId) {
                    $query->where('routes_id', $routeId);
                }),
                //not owner of route
                'different:' . $route->users_id,
            ]
        ]);

        //set remove users id
        $removeUserId = $request["user_id"];

        //find record
        $routeUser = \App\Models\Route\RouteUser::where('users_id', $removeUserId)
            ->where('routes_id', $routeId)
            ->firstOrFail();

        //authorize
        $this->authorize('delete', $routeUser);

        //delete record
        $routeUser->delete();

        //response
        return response()->success([], 201);
    }
}
