import { MapPinned, UserPlus } from "lucide-react";
import { useJoinRoute } from "../hooks/useJoinRoute";
import InviteDetailsSection from "../components/InviteDetailsSection/InviteDetailsSection";
import JoinRouteActions from "../components/JoinRouteActions/JoinRouteActions";
import "./JoinRoute.css";

const JoinRoute: React.FC = () => {
  const {
    inviteDetails,
    isFetchingDetails,
    isAcceptingInvite,
    error,
    handleAcceptInvite,
    navigateToRouteMap,
    navigateToHome,
  } = useJoinRoute();

  const pageTitle = inviteDetails?.is_owner
    ? "Toto je vaše trasa"
    : inviteDetails?.is_member
      ? "Již jste součástí trasy"
      : "Byli jste pozváni k trase";

  const pageSubtitle = inviteDetails?.is_owner || inviteDetails?.is_member
    ? "Již máte přístup k této trase. Můžete rovnou přejít na prohlížení mapy."
    : "Přijměte pozvánku, abyste mohli společně s ostatními členy prohlížet a plánovat tuto trasu";

  {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
  {/* Layout and structure generated from design. Data binding and variables added manually. */}

  return (
    <div className="join-route-container">
      <div className="join-route-card">
        <div className="join-route-icon-wrapper">
          <div className="join-route-icon-inner">
            <MapPinned size={32} className="join-route-icon-primary" />
            <div className="join-route-icon-badge">
              <UserPlus size={14} />
            </div>
          </div>
        </div>

        <div className="join-route-header">
          <h1 className="join-route-title">{pageTitle}</h1>
          <p className="join-route-subtitle">{pageSubtitle}</p>
        </div>

        <InviteDetailsSection
          isFetchingDetails={isFetchingDetails}
          inviteDetails={inviteDetails}
        />

        {error && (
          <div className="join-route-error">{error}</div>
        )}

        <JoinRouteActions
          inviteDetails={inviteDetails}
          isAcceptingInvite={isAcceptingInvite}
          isFetchingDetails={isFetchingDetails}
          hasError={error !== null}
          onAcceptInvite={handleAcceptInvite}
          onNavigateToRouteMap={navigateToRouteMap}
          onNavigateToHome={navigateToHome}
        />
      </div>
    </div>
  );

  {/* --- END: AI-GENERATED UI --- */}
};

export default JoinRoute;
