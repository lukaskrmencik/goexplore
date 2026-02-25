import { useState, useEffect } from "react";
import type { Route } from "../../../../types/routes";
import {
    inviteUserToRoute,
    removeUserFromRoute,
    fetchGetRoute
} from "../../../../services/routesApiService";
import { getErrorMessage } from "../../../../utils/apiError";

export const useRouteUsers = (route: Route, onUpdateRoute: (route: Route) => void) => {
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRemovingId, setIsRemovingId] = useState<number | null>(null);

    const ROUTE_USERS_POLLING_INTERVAL = Number(import.meta.env.VITE_ROUTE_USERS_POLLING_INTERVAL ?? "5000");

    useEffect(() => {
        const intervalId = setInterval(async () => {
            try {
                const updatedRoute = await fetchGetRoute(route.id);
                if (JSON.stringify(updatedRoute.users) !== JSON.stringify(route.users)) {
                    onUpdateRoute(updatedRoute);
                }
            } catch (error) {
                console.error(error);
            }
        }, ROUTE_USERS_POLLING_INTERVAL);

        return () => clearInterval(intervalId);
    }, [route.id, route.users, onUpdateRoute]);

    // Auto-generate link on mount
    useEffect(() => {
        if (!inviteLink && !isGenerating) {
            generateLink();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const generateLink = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const token = await inviteUserToRoute(route.id);

            const baseUrl =
                import.meta.env.VITE_INVITE_BASE_URL?.trim() ||
                (typeof window !== "undefined" ? window.location.origin : "");

            const url = `${baseUrl}/join/${token}`;
            setInviteLink(url);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Nepodařilo se vytvořit odkaz."));
        } finally {
            setIsGenerating(false);
        }
    };

    const removeUser = async (userId: number) => {
        setIsRemovingId(userId);
        setError(null);
        try {
            await removeUserFromRoute(route.id, userId);
            const updatedRoute = await fetchGetRoute(route.id);
            onUpdateRoute(updatedRoute);
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err, "Nepodařilo se odebrat uživatele."));
        } finally {
            setIsRemovingId(null);
        }
    };

    const clearError = () => setError(null);

    return {
        inviteLink,
        isGenerating,
        generateLink,
        removeUser,
        isRemovingId,
        error,
        clearError
    };
};
