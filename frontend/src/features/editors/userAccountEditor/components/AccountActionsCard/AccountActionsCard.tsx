import React from 'react';
import { LogOut } from 'lucide-react';
import './AccountActionsCard.css';

interface AccountActionsCardProps {
    onLogout: () => void;
    onDeleteRequest: () => void;
}

const AccountActionsCard: React.FC<AccountActionsCardProps> = ({ onLogout, onDeleteRequest }) => (
    <div className="account-editor-actions-card">
        <button onClick={onLogout} className="account-logout-btn">
            <LogOut size={18} />
            Odhlásit se
        </button>
        <div className="account-danger-group">
            <button onClick={onDeleteRequest} className="account-delete-account-btn">
                Smazat účet
            </button>
            <p className="account-action-desc">Smazání účtu je nevratné a smaže všechna data účtu.</p>
        </div>
    </div>
);

export default AccountActionsCard;
