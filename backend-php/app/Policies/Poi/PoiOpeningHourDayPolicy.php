<?php

namespace App\Policies\Poi;

use App\Models\Poi\PoiOpeningHourDay;
use App\Models\User\User;
use Illuminate\Auth\Access\Response;

class PoiOpeningHourDayPolicy
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
    public function view(User $user, PoiOpeningHourDay $poiOpeningHourDay): bool
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
    public function update(User $user, PoiOpeningHourDay $poiOpeningHourDay): bool
    {
        return $user->role == 'admin';
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, PoiOpeningHourDay $poiOpeningHourDay): bool
    {
        return $user->role == 'admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, PoiOpeningHourDay $poiOpeningHourDay): bool
    {
        return $user->role == 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, PoiOpeningHourDay $poiOpeningHourDay): bool
    {
        return $user->role == 'admin';
    }
}
