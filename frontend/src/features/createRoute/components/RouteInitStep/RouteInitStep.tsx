import { useState } from "react";
import type { RouteMode } from "../../../../types/routes";
import { Badge } from "../../../../components/ui/Badge/Badge";
import { Map, Zap } from "lucide-react";
import './RouteInitStep.css';

interface RouteInitStepProps {
    onInitialize: (mode: RouteMode, name: string) => void;
}

const RouteInitStep: React.FC<RouteInitStepProps> = ({ onInitialize }) => {
    const [routeName, setRouteName] = useState("");

    return (
        <div className="route-init-container">
            <div className="route-init-content">
                <div className="route-init-grid">

                    {/* Left Column: Context & Input */}
                    <div className="route-init-left">
                        <div className="route-init-header">
                            <Badge variant="primary" className="route-init-step-badge">
                                Krok 1/3
                            </Badge>
                            <h1 className="route-init-title">
                                Kam to bude <span className="route-init-title-highlight">dnes?</span>
                            </h1>
                        </div>

                        <div className="route-init-input-group">
                            <label htmlFor="routeName" className="route-init-label">
                                Název cesty
                            </label>
                            <div className="route-init-input-wrapper">
                                <input
                                    id="routeName"
                                    type="text"
                                    placeholder="např. Víkend na Šumavě"
                                    value={routeName}
                                    onChange={(e) => setRouteName(e.target.value)}
                                    className="route-init-input"
                                />
                                <div className="route-init-input-icon">
                                    <span className="text-sm font-bold">✎</span>
                                </div>
                            </div>
                            <p className="route-init-input-help">
                                <span className="route-init-input-help-dot"></span>
                                Název můžete kdykoliv později změnit
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Cards */}
                    <div className="route-init-right">
                        {/* Simple Mode */}
                        <button
                            onClick={() => onInitialize('simple', routeName)}
                            className="route-mode-btn route-mode-btn-simple"
                        >
                            <div className="route-mode-icon-wrapper route-mode-icon-simple">
                                <Zap className="route-mode-icon" strokeWidth={1.5} />
                            </div>

                            <div className="route-mode-content">
                                <div className="route-mode-header">
                                    <h3 className="route-mode-title">
                                        Chytrý návrh
                                    </h3>
                                    <Badge variant="primary" className="route-mode-badge-simple">
                                        Doporučeno
                                    </Badge>
                                </div>
                                <p className="route-mode-desc">
                                    Zadejte pouze start a cíl. Náš algoritmus najde nejzajímavější trasu mezi nimi.
                                </p>
                            </div>
                        </button>

                        {/* Manual Mode */}
                        <button
                            onClick={() => onInitialize('manual', routeName)}
                            className="route-mode-btn route-mode-btn-manual"
                        >
                            <div className="route-mode-icon-wrapper route-mode-icon-manual">
                                <Map className="route-mode-icon" strokeWidth={1.5} />
                            </div>

                            <div className="route-mode-content">
                                <div className="route-mode-header">
                                    <h3 className="route-mode-title">
                                        Vlastní trasa
                                    </h3>
                                    <Badge variant="neutral" className="route-mode-badge-manual">
                                        Pokročilé
                                    </Badge>
                                </div>
                                <p className="route-mode-desc">
                                    Plná kontrola. Vyklikejte si každý bod cesty ručně na mapě.
                                </p>
                            </div>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RouteInitStep;
