import { Loader2, User, Map } from "lucide-react";
import type { InviteDetails } from "../../../../types/routes";
import './InviteDetailsSection.css';

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

{/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
{/* Layout and structure generated from design. Data binding and variables added manually. */}

  return (
    <div className="join-route-details-box">
      <div className="join-route-detail-item">
        <User size={18} className="join-route-detail-icon" />
        <div className="join-route-detail-text">
          <span className="join-route-detail-label">Organizátor trasy:</span>
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

  {/* --- END: AI-GENERATED UI --- */}
};

export default InviteDetailsSection;
