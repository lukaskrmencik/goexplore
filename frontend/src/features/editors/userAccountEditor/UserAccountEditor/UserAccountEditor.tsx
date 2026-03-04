import React, { useRef } from "react";
import { Loader2 } from "lucide-react";
import { useUserAccount } from "../hooks/useUserAccount";
import ProfileAvatarCard from "../components/ProfileAvatarCard/ProfileAvatarCard";
import PersonalDataForm from "../components/PersonalDataForm/PersonalDataForm";
import AccountActionsCard from "../components/AccountActionsCard/AccountActionsCard";
import ConfirmDialog from "../../../../components/ui/ConfirmDialog/ConfirmDialog";
import Toast from "../../../../components/ui/Toast/Toast";
import "./UserAccountEditor.css";

const UserAccountEditor: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
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
    } = useUserAccount(fileInputRef);

    if (isLoading) {
        return (
            <div className="account-editor-loading">
                <Loader2 className="animate-spin" size={32} />
                <p>Načítání profilu...</p>
            </div>
        );
    }

    return (
        <div className="account-page-container">
            <div className="account-page-header-wrapper">
                <h1 className="account-page-title">Účet</h1>
            </div>
        <div className="account-editor-container">
            <ProfileAvatarCard
                user={user}
                isUploading={isUploading}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
            />

            <PersonalDataForm
                user={user}
                name={name}
                isSaving={isSaving}
                onNameChange={setName}
                onSave={handleSave}
            />

            <AccountActionsCard
                onLogout={handleLogout}
                onDeleteRequest={() => setShowDeleteConfirm(true)}
            />

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

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
        </div>
    );
};

export default UserAccountEditor;
