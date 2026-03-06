import './RouteLengthBanner.css';

interface RouteLengthBannerProps {
    estimatedKm: number;
    minimumRequiredKm: number;
}

const RouteLengthBanner: React.FC<RouteLengthBannerProps> = ({ estimatedKm, minimumRequiredKm }) => {
    if (estimatedKm <= 0) return null;

    const isAboveMinimum = estimatedKm >= minimumRequiredKm;

    {/* --- START: AI-GENERATED UI (Gemini 3.1 Pro) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

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

    {/* --- END: AI-GENERATED UI --- */}
};

export default RouteLengthBanner;
