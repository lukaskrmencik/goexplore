import type { PaceInfo } from "../../../../../types/routes";

interface PaceInfoBoxProps {
    paceInfo: PaceInfo | null;
}

const PaceInfoBox: React.FC<PaceInfoBoxProps> = ({ paceInfo }) => {
    const containerClass = paceInfo
        ? (paceInfo.isValid ? 'route-date-pace-info-ok'
            : paceInfo.isUnderMin ? 'route-date-pace-info-warn'
                : 'route-date-pace-info-error')
        : 'route-date-pace-info-placeholder';

    return (
        <div className={`route-date-pace-info ${containerClass}`}>
            {paceInfo ? (
                <>
                    <div className="route-date-pace-info-row">
                        <span className="route-date-pace-info-label">Odhadované tempo:</span>
                        <strong className="route-date-pace-info-value">{Math.round(paceInfo.kmPerDay)} km/den</strong>
                    </div>
                    {paceInfo.isUnderMin && (
                        <p className="route-date-pace-info-hint">
                            Minimum je {paceInfo.minKmPerDay} km/den — zkraťte dobu cesty.
                        </p>
                    )}
                    {paceInfo.isOverMax && (
                        <p className="route-date-pace-info-hint">
                            Maximum je {paceInfo.maxKmPerDay} km/den — prodlužte dobu cesty.
                        </p>
                    )}
                </>
            ) : (
                <div className="route-date-pace-info-row">
                    <span className="route-date-pace-info-label route-date-pace-info-label-muted">
                        Tempo se zobrazí po výběru dat
                    </span>
                </div>
            )}
        </div>
    );
};

export default PaceInfoBox;
