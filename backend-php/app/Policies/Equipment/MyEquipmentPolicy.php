<?php

namespace App\Policies\Equipment;

use App\Models\Equipment\MyEquipment;
use App\Models\User\User;
use Illuminate\Auth\Access\Response;

class MyEquipmentPolicy
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
    public function view(User $user, MyEquipment $myEquipment): bool
    {
        if ($user->role == 'admin') {
             true;
        }

        if ($user->id == $myEquipment->users_id) {
            return true;
        }

        return $myEquipment->routes()
            ->whereHas('users', fn($q) => $q->where('users.id', $user->id))
            ->exists();

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
    public function update(User $user, MyEquipment $myEquipment): bool
    {
        return $user->role == 'admin' || $user->id == $myEquipment->users_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, MyEquipment $myEquipment): bool
    {
        return $user->role == 'admin' || $user->id == $myEquipment->users_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, MyEquipment $myEquipment): bool
    {
        return $user->role == 'admin';

    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, MyEquipment $myEquipment): bool
    {
        return $user->role == 'admin';
    }
}
