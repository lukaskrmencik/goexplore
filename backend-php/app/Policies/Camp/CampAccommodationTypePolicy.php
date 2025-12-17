<?php

namespace App\Policies\Camp;

use App\Models\Camp\CampAccommodationType;
use App\Models\User\User;
use Illuminate\Auth\Access\Response;

class CampAccommodationTypePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, CampAccommodationType $campAccommodationType): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role == 'admin';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, CampAccommodationType $campAccommodationType): bool
    {
        return $user->role == 'admin';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, CampAccommodationType $campAccommodationType): bool
    {
        return $user->role == 'admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, CampAccommodationType $campAccommodationType): bool
    {
        return $user->role == 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, CampAccommodationType $campAccommodationType): bool
    {
        return $user->role == 'admin';
    }
}
