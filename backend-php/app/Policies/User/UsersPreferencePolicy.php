<?php

namespace App\Policies\User;

use App\Models\User\User;
use App\Models\User\UsersPreference;
use Illuminate\Auth\Access\Response;

class UsersPreferencePolicy
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
    public function view(User $user, CategoryScore $categoryScore): bool
    {
        return $user->role == 'admin' || $categoryScore->users_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, CategoryScore $categoryScore): bool
    {
        return $user->role == 'admin' || $categoryScore->users_id === $user->id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, CategoryScore $categoryScore): bool
    {
        return $user->role == 'admin' || $categoryScore->users_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CategoryScore $categoryScore): bool
    {
        return $user->role == 'admin' || $categoryScore->users_id === $user->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, CategoryScore $categoryScore): bool
    {
        return $user->role == 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, CategoryScore $categoryScore): bool
    {
        return $user->role == 'admin';
    }
}
