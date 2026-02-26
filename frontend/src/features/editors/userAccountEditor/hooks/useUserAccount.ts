import React, { useState, useEffect } from 'react';
import { fetchMyUser, updateMyProfile, uploadProfilePicture, deleteMyAccount } from '../../../../services/usersApiService';
import { logout } from '../../../../services/authApiService';
import type { User } from '../../../../types/users';
import { getErrorMessage } from '../../../../utils/apiError';
import { AUTH_TOKEN_KEY } from '../../../../utils/auth';

export interface AccountToastState {
    message: string;
    type: 'success' | 'error';
}

export const useUserAccount = (fileInputRef: React.RefObject<HTMLInputElement | null>) => {
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toast, setToast] = useState<AccountToastState | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    useEffect(() => {
        fetchMyUser()
            .then(data => {
                setUser(data);
                setName(data.name);
            })
            .catch(() => {
                showToast("Nepodařilo se načíst profil.", "error");
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateMyProfile({ name });
            setUser(prev => prev ? { ...prev, name } : null);
            showToast("Profil byl úspěšně aktualizován.", "success");
        } catch (err) {
            showToast(getErrorMessage(err, "Aktualizace selhala."), "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const newProfilePicturePath = await uploadProfilePicture(file);
            setUser(prev => prev ? { ...prev, profile_picture: newProfilePicturePath } : null);
            showToast("Profilový obrázek byl úspěšně nahrán.", "success");
        } catch {
            showToast("Nepodařilo se nahrát obrázek.", "error");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch {
        } finally {
            localStorage.removeItem(AUTH_TOKEN_KEY);
            window.location.href = "/login";
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await deleteMyAccount();
            localStorage.removeItem(AUTH_TOKEN_KEY);
            window.location.href = "/signup";
        } catch {
            showToast("Nepodařilo se smazat účet.", "error");
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return {
        user,
        name,
        setName,
        isLoading,
        isSaving,
        isUploading,
        showDeleteConfirm,
        setShowDeleteConfirm,
        isDeleting,
        toast,
        setToast,
        handleSave,
        handleFileChange,
        handleLogout,
        handleDeleteAccount,
    };
};
