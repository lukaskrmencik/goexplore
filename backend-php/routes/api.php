<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\User\AuthController;
use App\Http\Controllers\User\UserController;
use App\Http\Controllers\Equipment\MyEquipmentController;
use App\Http\Controllers\Equipment\GeneralEquipmentController;
use App\Http\Controllers\Route\RouteController;
use App\Http\Controllers\Route\RouteEquipmentController;
use App\Http\Controllers\Route\WaypointController;
use App\Http\Controllers\Route\RouteUserController;
use App\Http\Controllers\Camp\CampController;
use App\Http\Controllers\Poi\PoiController;

Route::get('/user', function (Request $request) {
    return "ahojky";
});

Route::post('/signup', [AuthController::class, 'signup']);

//Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('jwt')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // User routes
    Route::get('/users/{id}', [UserController::class, 'singleUser'])
        ->where('id', '[0-9]+');
    Route::get('/users/my', [UserController::class, 'singleUser']);
    Route::patch('/users/my', [UserController::class, 'updateUser']);
    Route::delete('/users/my', [UserController::class, 'deleteUser']);
    Route::post('/users/my/profile-picture', [UserController::class, 'uploadProfilePicture']);
    Route::patch('/users/my/location', [UserController::class, 'setUserLocation']);


    //My equipment routes
    Route::get('/my-equipment/{id}', [MyEquipmentController::class, 'singleMyEquipment'])
        ->where('id', '[0-9]+');
    Route::post('/my-equipment/list', [MyEquipmentController::class, 'allMyEquipment']);
    Route::post('/my-equipment', [MyEquipmentController::class, 'createMyEquipment']);
    Route::patch('/my-equipment/{id}', [MyEquipmentController::class, 'updateMyEquipment'])
        ->where('id', '[0-9]+');
    Route::delete('/my-equipment/{id}', [MyEquipmentController::class, 'deleteMyEquipment'])
    ->where('id', '[0-9]+');

    //General equipment routes
    Route::get('/general-equipment/{id}', [GeneralEquipmentController::class, 'singleGeneralEquipment'])
        ->where('id', '[0-9]+');
    Route::post('/general-equipment/list', [GeneralEquipmentController::class, 'allGeneralEquipment']);

    //Route routes
    Route::post('/routes', [RouteController::class, 'createRoute']);
    Route::patch('/routes/{id}', [RouteController::class, 'updateRoute'])
        ->where('id', '[0-9]+');
    Route::get('/routes/{id}', [RouteController::class, 'singleRoute'])
        ->where('id', '[0-9]+');
    Route::delete('/routes/{id}', [RouteController::class, 'deleteRoute'])
        ->where('id', '[0-9]+');
    Route::post('/routes/list', [RouteController::class, 'allRoutes']);
    Route::post('/routes/shared', [RouteController::class, 'sharedRoutes']);
    Route::post('/routes/{id}/calculate', [RouteController::class, 'calculateRoute'])
        ->where('id', '[0-9]+');
    Route::get('/routes/job/{jobId}/progress', [RouteController::class, 'calculateRouteJobProgress'])
        ->where('jobId', '[A-Za-z0-9\-]+');

    //Route equipment routes
    Route::post('/routes/{id}/equipment', [RouteEquipmentController::class, 'addEquipment'])
        ->where('id', '[0-9]+');
    Route::delete('/routes/{id}/equipment', [RouteEquipmentController::class, 'removeEquipment'])
        ->where('id', '[0-9]+');

    //Route waypoints routes
    Route::post('/routes/{id}/waypoints', [WaypointController::class, 'createWaypoint'])
        ->where('id', '[0-9]+');
    Route::patch('/routes/waypoints/{id}', [WaypointController::class, 'updateWaypoint'])
        ->where('id', '[0-9]+');
    Route::delete('/routes/waypoints/{id}', [WaypointController::class, 'deleteWaypoint'])
        ->where('id', '[0-9]+');

    //Route users routes
    Route::post('/routes/{id}/users/invite', [RouteUserController::class, 'inviteUser'])
        ->where('id', '[0-9]+');
    Route::post('/routes/users/accept-invite', [RouteUserController::class, 'acceptInvite']);
    Route::delete('/routes/{id}/users', [RouteUserController::class, 'removeUser'])
        ->where('id', '[0-9]+');

    //Camps
    Route::get('/camps/{id}', [CampController::class, 'singleCamp'])
        ->where('id', '[0-9]+');
    //Poi
    Route::get('/poi/{id}', [PoiController::class, 'singlePoi'])
        ->where('id', '[0-9]+');
});
