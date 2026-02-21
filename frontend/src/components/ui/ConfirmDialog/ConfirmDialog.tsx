import { AlertTriangle } from 'lucide-react';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDestructive?: boolean;
    isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    description,
    confirmLabel = "Potvrdit",
    cancelLabel = "Zrušit",
    onConfirm,
    onCancel,
    isDestructive = false,
    isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="dialog-overlay">
            {/* Backdrop */}
            <div
                className="dialog-backdrop"
                onClick={!isLoading ? onCancel : undefined}
            />

            {/* Dialog */}
            <div className="dialog-content">
                <div className="dialog-body">
                    <div className="dialog-layout">
                        {/* Icon */}
                        <div className={`dialog-icon-wrapper ${isDestructive ? 'dialog-icon-destructive' : 'dialog-icon-standard'}`}>
                            <AlertTriangle size={24} />
                        </div>

                        {/* Content */}
                        <div className="dialog-text-content">
                            <h3 className="dialog-title">
                                {title}
                            </h3>
                            <p className="dialog-description">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="dialog-footer">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="dialog-btn dialog-btn-cancel"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`dialog-btn dialog-btn-confirm ${isDestructive ? 'dialog-btn-destructive' : 'dialog-btn-standard'}`}
                    >
                        {isLoading ? 'Zpracovávám...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
