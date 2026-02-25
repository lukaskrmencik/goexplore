import { Loader2, User, Map } from "lucide-react";
import type { InviteDetails } from "../../../types/routes";

interface InviteDetailsSectionProps {
    isFetchingDetails: boolean;
    inviteDetails: InviteDetails | null;
}

const InviteDetailsSection: React.FC<InviteDetailsSectionProps> = ({ isFetchingDetails, inviteDetails }) => {
    if (isFetchingDetails) {
        return (
            <div className="join-route-loading-details">
                <Loader2 size={24} className="animate-spin join-route-loading-icon" />
                <span>Načítám detaily pozvánky...</span>
            </div>
        );
    }

    if (!inviteDetails) return null;

    return (
        <div className="join-route-details-box">
            <div className="join-route-detail-item">
                <User size={18} className="join-route-detail-icon" />
                <div className="join-route-detail-text">
                    <span className="join-route-detail-label">Pozval vás:</span>
                    <span className="join-route-detail-value">{inviteDetails.inviter_name}</span>
                </div>
            </div>
            <div className="join-route-detail-item">
                <Map size={18} className="join-route-detail-icon" />
                <div className="join-route-detail-text">
                    <span className="join-route-detail-label">Název trasy:</span>
                    <span className="join-route-detail-value">{inviteDetails.route_name}</span>
                </div>
            </div>
        </div>
    );
};

export default InviteDetailsSection;
