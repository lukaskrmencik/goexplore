import React from 'react';
import { Loader2 } from 'lucide-react';
import './RouteGeneratingPlaceholder.css';

{/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
{/* Layout and structure generated from design. Data binding and variables added manually. */}
const RouteGeneratingPlaceholder: React.FC = () => (

    <div className="map-viewer-generating-container">
        <Loader2 size={48} className="map-viewer-generating-icon" />
        <h2 className="map-viewer-generating-title">Trasa se právě zpracovává</h2>
        <p className="map-viewer-generating-desc">
            Prosím vyčkejte. Organizátor trasy ji právě vytváří nebo systém propočítává body v mapě. Tato stránka se automaticky načte, jakmile bude trasa připravena.
        </p>
    </div>
);

{/* --- END: AI-GENERATED UI --- */}

export default RouteGeneratingPlaceholder;
