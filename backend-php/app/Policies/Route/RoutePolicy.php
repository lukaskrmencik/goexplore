<?php

namespace App\Policies\Route;

use App\Models\Route\Route;
use App\Models\User\User;
use Illuminate\Auth\Access\Response;

class RoutePolicy
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
    public function view(User $user, Route $route): bool
    {
        if ($user->role == 'admin') {
            return true;
        }

        if ($user->id == $route->users_id) {
            return true;
        }

        return $route->users()->where('users.id', $user->id)->exists();

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, ['user', 'admin']);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Route $route): bool
    {
        return $user->role == 'admin' || $user->id == $route->users_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Route $route): bool
    {
        return $user->role == 'admin' || $user->id == $route->users_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Route $route): bool
    {
        return $user->role == 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Route $route): bool
    {
        return $user->role == 'admin';
    }
}
