<?php

namespace App\Policies\Route;

use App\Models\Route\RoutePoi;
use App\Models\User\User;
use App\Models\Route\Route;
use Illuminate\Auth\Access\Response;

class RoutePoiPolicy
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
    public function view(User $user, RoutePoi $routePoi): bool
    {
        if($user->role == 'admin') {
            return true;
        }

        if ($routePoi->route->users_id === $user->id) {
            return true;
        }

        return $routePoi->route->users->contains('id', $user->id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Route $route): bool
    {
        if($user->role == 'admin') {
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
    public function update(User $user, RoutePoi $routePoi): bool
    {
        if($user->role == 'admin') {
            return true;
        }

        if ($routePoi->route->users_id === $user->id) {
            return true;
        }

        return $routePoi->route->users->contains('id', $user->id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, RoutePoi $routePoi): bool
    {
        if($user->role == 'admin') {
            return true;
        }

        if ($routePoi->route->users_id === $user->id) {
            return true;
        }

        return $routePoi->route->users->contains('id', $user->id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, RoutePoi $routePoi): bool
    {
        return $user->role == 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, RoutePoi $routePoi): bool
    {
        return $user->role == 'admin';
    }
}
