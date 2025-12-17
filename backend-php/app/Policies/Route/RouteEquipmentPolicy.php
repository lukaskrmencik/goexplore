<?php

namespace App\Policies\Route;

use App\Models\Route\RouteEquipment;
use App\Models\User\User;
use App\Models\Route\Route;
use Illuminate\Auth\Access\Response;

class RouteEquipmentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['user', 'admin']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, RouteEquipment $routeEquipment): bool
    {
        if($user->role == 'admin') {
            return true;
        }

        if ($routeEquipment->route->users_id === $user->id) {
            return true;
        }

        return $routeEquipment->route->users->contains('id', $user->id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, RouteEquipment $routeEquipment): bool
    {
        $route = $routeEquipment->route;

        if ($user->role === 'admin') {
            return true;
        }

        if ($route->users_id === $user->id) {
            return true;
        }

        return $route->users->contains('id', $user->id);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, RouteEquipment $routeEquipment): bool
    {
        if($user->role == 'admin') {
            return true;
        }

        if ($routeEquipment->route->users_id === $user->id) {
            return true;
        }

        return $routeEquipment->route->users->contains('id', $user->id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, RouteEquipment $routeEquipment): bool
    {
        if($user->role == 'admin') {
            return true;
        }

        if ($routeEquipment->route->users_id === $user->id) {
            return true;
        }

        return $routeEquipment->route->users->contains('id', $user->id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, RouteEquipment $routeEquipment): bool
    {
        return $user->role == 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, RouteEquipment $routeEquipment): bool
    {
        return $user->role == 'admin';
    }
}
