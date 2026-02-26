import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { acceptInviteToRoute, fetchInviteDetails } from "../../../services/routesApiService";
import type { InviteDetails } from "../../../types/routes";
import { getErrorMessage } from "../../../utils/apiError";
import { AUTH_TOKEN_KEY } from "../../../utils/auth";

export const useJoinRoute = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [isAcceptingInvite, setIsAcceptingInvite] = useState(false);
    const [isFetchingDetails, setIsFetchingDetails] = useState(true);
    const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (!authToken) {
            const redirectUrl = encodeURIComponent(location.pathname + location.search);
            navigate(`/login?redirect=${redirectUrl}`);
            return;
        }

        if (!token) {
            setError("Chybí token pozvánky.");
            setIsFetchingDetails(false);
            return;
        }

        fetchInviteDetails(token)
            .then(details => setInviteDetails(details))
            .catch(err => {
                setError(getErrorMessage(err, "Tuto pozvánku se nepodařilo načíst."));
            })
            .finally(() => setIsFetchingDetails(false));
    }, [navigate, location, token]);

    const handleAcceptInvite = async () => {
        if (!token) {
            setError("Neplatný nebo chybějící token pozvánky.");
            return;
        }

        setIsAcceptingInvite(true);
        setError(null);

        try {
            const routeId = await acceptInviteToRoute(token);
            navigate(`/map-viewer?id=${routeId}`);
        } catch (err) {
            setError(getErrorMessage(err, "Nepodařilo se přijmout pozvánku. Zkuste to prosím znovu."));
        } finally {
            setIsAcceptingInvite(false);
        }
    };

    const navigateToRouteMap = (routeId: number) => navigate(`/map-viewer?id=${routeId}`);
    const navigateToHome = () => navigate("/");

    return {
        inviteDetails,
        isFetchingDetails,
        isAcceptingInvite,
        error,
        handleAcceptInvite,
        navigateToRouteMap,
        navigateToHome,
    };
};
