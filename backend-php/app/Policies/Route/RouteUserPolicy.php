<?php

namespace App\Policies\Route;

use App\Models\Route\RouteUser;
use App\Models\User\User;
use App\Models\Route\Route;
use Illuminate\Auth\Access\Response;

class RouteUserPolicy
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
    public function view(User $user, RouteUser $routeUser): bool
    {
        if($user->role == 'admin') {
            return true;
        }

        if ($routeUser->route->users_id === $user->id) {
            return true;
        }

        return $routeUser->route->users->contains('id', $user->id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, RouteUser $routeUser): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        $route = $routeUser->route;

        return $route->users_id === $user->id;
    }

    //invite policy
    public function invite(User $user, RouteUser $routeUser): bool
    {
        $routeOwnerId = $routeUser->route->users_id;

        return $user->id !== $routeOwnerId;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, RouteUser $routeUser): bool
    {
        return $user->role == 'admin' || $routeUser->route->users_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, RouteUser $routeUser): bool
    {
        if($user->role == 'admin'){
            return true;
        }

        if($routeUser->route->users_id === $user->id){
            return true;
        }

        return $user->id == $routeUser->users_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, RouteUser $routeUser): bool
    {
        return $user->role == 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, RouteUser $routeUser): bool
    {
        return $user->role == 'admin';
    }
}
