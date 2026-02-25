import React, { useState, useEffect, useRef } from "react";
import { LogOut, Upload, Loader2, Save } from "lucide-react";
import { fetchMyProfile, updateMyProfile, uploadProfilePicture, deleteMyAccount } from "../../../../services/userApiService";
import { logout } from "../../../../services/authApiService";
import type { User } from "../../../../types/users";
import UserAvatar from "../../../../components/ui/UserAvatar/UserAvatar";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog/ConfirmDialog";
import Toast from "../../../../components/ui/Toast/Toast";
import "./UserAccountEditor.css";

const UserAccountEditor: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Dialog & Toast states
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error">("success");

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await fetchMyProfile();
                setUser(data);
                setName(data.name);
            } catch (err) {
                console.error("Failed to fetch profile", err);
                showToast("Nepodařilo se načíst profil.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
    }, []);

    const showToast = (message: string, type: "success" | "error") => {
        setToastMessage(message);
        setToastType(type);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateMyProfile({ name });
            setUser((prev) => prev ? { ...prev, name } : null);
            showToast("Profil byl úspěšně aktualizován.", "success");
        } catch (err: any) {
            console.error("Update failed", err);
            showToast(err.response?.data?.message || "Aktualizace selhala.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            try {
                // uploadProfilePicture now returns the direct string 'path'
                const newProfilePicturePath = await uploadProfilePicture(file);
                setUser((prev) => prev ? { ...prev, profile_picture: newProfilePicturePath } : null);
                showToast("Profilový obrázek byl úspěšně nahrán.", "success");
            } catch (err) {
                console.error("Upload failed", err);
                showToast("Nepodařilo se nahrát obrázek.", "error");
            } finally {
                setIsUploading(false);
                // Reset file input so same file can be selected again
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (e) {
            console.error("Logout err", e);
        } finally {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await deleteMyAccount();
            localStorage.removeItem("token");
            window.location.href = "/signup";
        } catch (err) {
            console.error("Delete failed", err);
            showToast("Nepodařilo se smazat účet.", "error");
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (isLoading) {
        return (
            <div className="account-editor-loading">
                <Loader2 className="animate-spin" size={32} />
                <p>Načítání profilu...</p>
            </div>
        );
    }

    return (
        <div className="account-editor-container">
            {/* Column 1: Profile */}
            <div className="account-editor-profile-card">
                <div
                    className="account-avatar-wrapper group"
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                    <UserAvatar
                        name={user?.name || "User"}
                        profilePicture={user?.profile_picture}
                    />
                    <div className="account-avatar-overlay">
                        {isUploading ? <Loader2 className="animate-spin text-white" size={32} /> : <Upload className="text-white" size={32} />}
                    </div>
                </div>

                <div className="account-user-info">
                    <h2>{user?.name}</h2>
                    <p>{user?.email}</p>
                </div>

                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
            </div>

            {/* Column 2: Form */}
            <div className="account-editor-card">
                <h3>Osobní údaje</h3>
                <form onSubmit={handleSave} className="account-editor-form">
                    <div className="account-form-group">
                        <label>Jméno</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="account-input"
                        />
                    </div>
                    {/* Read-only email display */}
                    <div className="account-form-group">
                        <label>E-mail</label>
                        <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            title="E-mail nelze změnit"
                            className="account-input account-input-disabled"
                        />
                    </div>

                    <button type="submit" className="account-save-btn" disabled={isSaving || name === user?.name}>
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {isSaving ? "Ukládání..." : "Uložit změny"}
                    </button>
                </form>
            </div>

            {/* Column 3: Actions */}
            <div className="account-editor-actions-card">
                <button onClick={handleLogout} className="account-logout-btn">
                    <LogOut size={18} />
                    Odhlásit se
                </button>

                <div className="account-danger-group">
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="account-delete-account-btn"
                    >
                        Smazat účet
                    </button>
                    <p className="account-action-desc">Smazání účtu je nevratné a smaže všechna data účtu.</p>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Smazat účet"
                description="Opravdu chcete trvale smazat svůj účet a všechna data? Tato akce je zcela nevratná a nebudete se moci přihlásit."
                confirmLabel="Smazat účet"
                cancelLabel="Zrušit"
                onConfirm={handleDeleteAccount}
                onCancel={() => setShowDeleteConfirm(false)}
                isDestructive={true}
                isLoading={isDeleting}
            />

            {toastMessage && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setToastMessage(null)}
                />
            )}
        </div>
    );
};

export default UserAccountEditor;
