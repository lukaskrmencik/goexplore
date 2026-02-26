import { Loader2, MapPinned, Users } from "lucide-react";
import type { InviteDetails } from "../../../../types/routes";
import './JoinRouteActions.css';

interface JoinRouteActionsProps {
    inviteDetails: InviteDetails | null;
    isAcceptingInvite: boolean;
    isFetchingDetails: boolean;
    hasError: boolean;
    onAcceptInvite: () => void;
    onNavigateToRouteMap: (routeId: number) => void;
    onNavigateToHome: () => void;
}

const JoinRouteActions: React.FC<JoinRouteActionsProps> = ({
    inviteDetails,
    isAcceptingInvite,
    isFetchingDetails,
    hasError,
    onAcceptInvite,
    onNavigateToRouteMap,
    onNavigateToHome,
}) => {
    const isAlreadyMemberOrOwner = inviteDetails?.is_owner || inviteDetails?.is_member;

    return (
        <div className="join-route-actions">
            {isAlreadyMemberOrOwner ? (
                <button
                    className="join-route-accept-btn"
                    onClick={() => onNavigateToRouteMap(inviteDetails!.route_id)}
                    disabled={isAcceptingInvite}
                >
                    <MapPinned size={20} />
                    Přejít na mapu
                </button>
            ) : (
                <button
                    className="join-route-accept-btn"
                    onClick={onAcceptInvite}
                    disabled={isAcceptingInvite || isFetchingDetails || hasError}
                >
                    {isAcceptingInvite ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Připojuji se...
                        </>
                    ) : (
                        <>
                            <Users size={20} />
                            Přijmout pozvánku do trasy
                        </>
                    )}
                </button>
            )}

            <button
                className="join-route-cancel-btn"
                onClick={onNavigateToHome}
                disabled={isAcceptingInvite}
            >
                Zpět na hlavní stránku
            </button>
        </div>
    );
};

export default JoinRouteActions;
