import { useState, useEffect, useCallback } from "react";
import type { Route } from "../../../../types/routes";
import type { RouteUser } from "../../../../types/users";
import {
    inviteUserToRoute,
    removeUserFromRoute,
    fetchGetRoute
} from "../../../../services/routesApiService";
import { fetchMyUser } from "../../../../services/usersApiService";
import { getErrorMessage } from "../../../../utils/apiError";


const ROUTE_USERS_POLLING_INTERVAL = Number(import.meta.env.VITE_ROUTE_USERS_POLLING_INTERVAL ?? "5000");


export const useRouteUsers = (route: Route, onUpdateRoute: (route: Route) => void) => {
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRemovingId, setIsRemovingId] = useState<number | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number>(0);


    useEffect(() => {
        fetchMyUser()
            .then(user => setCurrentUserId(user.id))
            .catch(() => {});
    }, []);


    useEffect(() => {
        if (!route.id) return;
        fetchGetRoute(route.id)
            .then(onUpdateRoute)
            .catch(() => {});
    }, [route.id, onUpdateRoute]);


    const generateInviteLink = useCallback(async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const token = await inviteUserToRoute(route.id);
            const baseUrl = import.meta.env.VITE_INVITE_BASE_URL?.trim() || window.location.origin;
            setInviteLink(`${baseUrl}/join/${token}`);
        } catch (err) {
            setError(getErrorMessage(err, "Nepodařilo se vytvořit odkaz."));
        } finally {
            setIsGenerating(false);
        }
    }, [route.id]);


    useEffect(() => {
        generateInviteLink();
    }, [generateInviteLink]);


    useEffect(() => {
        const intervalId = setInterval(async () => {
            try {
                const updatedRoute = await fetchGetRoute(route.id);
                if (JSON.stringify(updatedRoute.users) !== JSON.stringify(route.users)) {
                    onUpdateRoute(updatedRoute);
                }
            } catch {
            }
        }, ROUTE_USERS_POLLING_INTERVAL);


        return () => clearInterval(intervalId);
    }, [route.id, route.users, onUpdateRoute]);


    const removeUser = async (userId: number) => {
        setIsRemovingId(userId);
        setError(null);

        try {
            await removeUserFromRoute(route.id, userId);
            const updatedRoute = await fetchGetRoute(route.id);
            onUpdateRoute(updatedRoute);
            
        } catch (err) {
            setError(getErrorMessage(err, "Nepodařilo se odebrat uživatele."));

        } finally {
            setIsRemovingId(null);
        }
    };

    const clearError = () => setError(null);

    const ownerId = route.user?.id ?? 0;

    const ownerAsRouteUser: RouteUser | null = route.user
        ? {
            ...route.user,
            role: "owner",
            pivot: {
                routes_id: route.id,
                users_id: route.user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }
        }
        : null;

    const allUsers: RouteUser[] = ownerAsRouteUser
        ? [ownerAsRouteUser, ...(route.users || [])]
        : [...(route.users || [])];

    return {
        inviteLink,
        isGenerating,
        allUsers,
        currentUserId,
        ownerId,
        removeUser,
        isRemovingId,
        error,
        clearError
    };
};
