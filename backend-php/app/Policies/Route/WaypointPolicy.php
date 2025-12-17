<?php

namespace App\Policies\Route;

use App\Models\User\User;
use App\Models\Route\Waypoint;
use Illuminate\Auth\Access\Response;

class WaypointPolicy
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
    public function view(User $user, Waypoint $waypoint): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($waypoint->route->users_id == $user->id) {
            return true;
        }

        return $waypoint->route->users()
            ->where('users.id', $user->id)
            ->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Waypoint $waypoint): bool
    {
        $route = $waypoint->route;

        if ($user->role == 'admin') {
            return true;
        }

        if ($route->users_id == $user->id) {
            return true;
        }

        if ($route->users()->where('users.id', $user->id)->exists()) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Waypoint $waypoint): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($waypoint->route->users_id == $user->id) {
            return true;
        }

        return $waypoint->route->users()
            ->where('users.id', $user->id)
            ->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Waypoint $waypoint): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($waypoint->route->users_id == $user->id) {
            return true;
        }

        return $waypoint->route->users()
            ->where('users.id', $user->id)
            ->exists();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Waypoint $waypoint): bool
    {
        return $user->role == 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Waypoint $waypoint): bool
    {
        return $user->role == 'admin';
    }
}
