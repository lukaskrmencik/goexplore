import React from 'react';
import { Upload, Loader2 } from 'lucide-react';
import './ProfileAvatarCard.css';
import type { User } from '../../../../../types/users';
import UserAvatar from '../../../../../components/ui/UserAvatar/UserAvatar';

interface ProfileAvatarCardProps {
    user: User | null;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

{/* --- START: AI-GENERATED UI (Gemini 3.1 Pro) --- */}
{/* Layout and structure generated from design. Data binding and variables added manually. */}

const ProfileAvatarCard: React.FC<ProfileAvatarCardProps> = ({
    user,
    isUploading,
    fileInputRef,
    onFileChange,
}) => (
    <div className="account-editor-profile-card">
        <div
            className="account-avatar-wrapper"
            onClick={() => !isUploading && fileInputRef.current?.click()}
        >
            <UserAvatar
                name={user?.name || "User"}
                profilePicture={user?.profile_picture}
            />
            <div className="account-avatar-overlay">
                {isUploading
                    ? <Loader2 className="animate-spin avatar-overlay-icon" size={32} />
                    : <Upload className="avatar-overlay-icon" size={32} />
                }
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
            onChange={onFileChange}
        />
    </div>
);

{/* --- END: AI-GENERATED UI --- */}

export default ProfileAvatarCard;
