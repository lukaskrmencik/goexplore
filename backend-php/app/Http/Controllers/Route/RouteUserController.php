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
            'token' => $token,
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

        //save user to db but keep the invite token reusable
        //create a new membership record for this user and route
        $membership = new RouteUser([
            'routes_id'    => $routeUser->routes_id,
            'users_id'     => $userId,
            'invite_token' => null,
            'expires_at'   => $routeUser->expires_at,
        ]);
        $membership->save();

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

    //get details about the invite token
    public function getInviteDetails(Request $request, $token)
    {
        //auth user
        $userId = auth()->id();

        //find record with token
        $routeUser = RouteUser::with(['route', 'route.user'])
            ->where('invite_token', $token)
            ->first();

        //token not found or used
        if (!$routeUser) {
            return response()->error('Tato pozvánka je neplatná nebo již byla použita.', 404);
        }

        //set current date
        $now = Carbon::now();

        //check if token expired
        if ($routeUser->expires_at->lt($now)) {
            return response()->error('Tato pozvánka již vypršela.', 410);
        }

        $inviterName = $routeUser->route && $routeUser->route->user ? $routeUser->route->user->name : 'Neznámý uživatel';
        $routeName = $routeUser->route && $routeUser->route->name ? $routeUser->route->name : 'Nepojmenovaná trasa';
        $routeId = $routeUser->routes_id;

        // Check ownership
        $isOwner = $routeUser->route && ($routeUser->route->users_id === $userId);

        // Check if already a member
        $isMember = false;
        if (!$isOwner) {
            $memberExists = RouteUser::where('users_id', $userId)
                ->where('routes_id', $routeId)
                ->exists();
            $isMember = $memberExists;
        }

        //response
        return response()->success([
            'inviter_name' => $inviterName,
            'route_name' => $routeName,
            'route_id' => $routeId,
            'is_owner' => $isOwner,
            'is_member' => $isMember
        ], 200);
    }
}
