import './RouteLengthBanner.css';

interface RouteLengthBannerProps {
    estimatedKm: number;
    minimumRequiredKm: number;
}

const RouteLengthBanner: React.FC<RouteLengthBannerProps> = ({ estimatedKm, minimumRequiredKm }) => {
    if (estimatedKm <= 0) return null;

    const isAboveMinimum = estimatedKm >= minimumRequiredKm;

    return (
        <div className={`route-axis-editor-length-banner ${isAboveMinimum ? 'route-axis-editor-length-banner-ok' : 'route-axis-editor-length-banner-warn'}`}>
            <span>
                Odhadovaná délka trasy: <strong>{Math.round(estimatedKm)} km</strong>
                {!isAboveMinimum && (
                    <span className="route-axis-editor-length-banner-hint">
                        {' '}— minimum je {Math.round(minimumRequiredKm)} km
                    </span>
                )}
            </span>
        </div>
    );
};

export default RouteLengthBanner;
