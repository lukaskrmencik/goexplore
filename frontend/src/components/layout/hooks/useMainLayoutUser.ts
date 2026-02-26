import { useState, useEffect } from 'react';
import type { User } from '../../../types/users';
import { fetchMyUser } from '../../../services/usersApiService';

export const useMainLayoutUser = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        fetchMyUser().then(setCurrentUser).catch(() => {});
    }, []);

    return { currentUser };
};
