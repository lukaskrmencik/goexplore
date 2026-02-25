import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { acceptInviteToRoute, fetchInviteDetails } from '../../services/routesApiService';
import type { InviteDetails } from '../../types/routes';
import { Loader2, UserPlus, MapPinned, Users, User, Map } from 'lucide-react';
import './JoinRoutePage.css';

const JoinRoutePage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingDetails, setIsFetchingDetails] = useState(true);
    const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initial Auth Check
    useEffect(() => {
        const checkAuth = () => {
            const authToken = localStorage.getItem('token');
            if (!authToken) {
                // Not authenticated! Redirect to login with a redirect query param back to this exact invite URL
                const redirectUrl = encodeURIComponent(location.pathname + location.search);
                navigate(`/login?redirect=${redirectUrl}`);
                return;
            }

            if (token) {
                fetchDetails(token);
            } else {
                setError('Chybí token pozvánky.');
                setIsFetchingDetails(false);
            }
        };

        const fetchDetails = async (tokenStr: string) => {
            try {
                const details = await fetchInviteDetails(tokenStr);
                setInviteDetails(details);
            } catch (err: any) {
                console.error('Failed to fetch invite details:', err);
                setError(err.response?.data?.message || 'Tuto pozvánku se nepodařilo načíst.');
            } finally {
                setIsFetchingDetails(false);
            }
        };

        checkAuth();
    }, [navigate, location, token]);

    const handleAcceptInvite = async () => {
        if (!token) {
            setError('Neplatný nebo chybějící token pozvánky.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const routeId = await acceptInviteToRoute(token);
            // Successfully joined! Redirect to the Map Viewer for this route
            navigate(`/map-viewer?id=${routeId}`);
        } catch (err: any) {
            console.error('Failed to accept invite:', err);
            setError(err.response?.data?.message || 'Nepodařilo se přijmout pozvánku. Zkuste to prosím znovu.');
        } finally {
            setIsLoading(false);
        }
    };

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
                    <h1 className="join-route-title">
                        {inviteDetails?.is_owner ? 'Toto je vaše trasa' : inviteDetails?.is_member ? 'Již jste součástí trasy' : 'Byli jste pozváni k cestě'}
                    </h1>
                    <p className="join-route-subtitle">
                        {inviteDetails?.is_owner || inviteDetails?.is_member
                            ? 'Již máte přístup k této trase. Můžete rovnou přejít na prohlížení mapy.'
                            : 'Přijměte pozvánku, abyste mohli společně s ostatními členy prohlížet a plánovat tuto skvělou výpravu v GoExplore.'}
                    </p>
                </div>

                {isFetchingDetails ? (
                    <div className="join-route-loading-details">
                        <Loader2 size={24} className="animate-spin join-route-loading-icon" />
                        <span>Načítám detaily pozvánky...</span>
                    </div>
                ) : inviteDetails ? (
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
                ) : null}

                {error && (
                    <div className="join-route-error">
                        {error}
                    </div>
                )}

                <div className="join-route-actions">
                    {/* Member/Owner Logic */}
                    {inviteDetails?.is_owner || inviteDetails?.is_member ? (
                        <button
                            className="join-route-accept-btn"
                            onClick={() => navigate(`/map-viewer?id=${inviteDetails.route_id}`)}
                            disabled={isLoading}
                        >
                            <MapPinned size={20} />
                            Přejít na mapu
                        </button>
                    ) : (
                        <button
                            className="join-route-accept-btn"
                            onClick={handleAcceptInvite}
                            disabled={isLoading || isFetchingDetails || error !== null}
                        >
                            {isLoading ? (
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
                        onClick={() => navigate('/')}
                        disabled={isLoading}
                    >
                        Zpět na hlavní stránku
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinRoutePage;
