import { useState } from "react";
import type { RouteMode } from "../../../../types/routes";
import { Badge } from "../../../../components/ui/Badge/Badge";
import { ArrowRight } from "lucide-react";
import './RouteInitStep.css';

interface RouteInitStepProps {
    onInitialize: (mode: RouteMode, name: string) => void;
}

const RouteInitStep: React.FC<RouteInitStepProps> = ({ onInitialize }) => {
    const [routeName, setRouteName] = useState("");

    return (
        <div className="route-init-container">
            <div className="route-init-content">
                <div className="route-init-header">
                    <h1 className="route-init-title">
                        Nová trasa
                    </h1>
                </div>

                <div className="route-init-input-group">
                    <label htmlFor="routeName" className="route-init-input-label">Název trasy</label>
                    <div className="route-init-input-wrapper">
                        <input
                            id="routeName"
                            type="text"
                            placeholder="Zvolte název pro vaši trasu"
                            value={routeName}
                            onChange={(e) => setRouteName(e.target.value)}
                            className="route-init-input"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="route-mode-selection-wrapper">
                    <h2 className="route-mode-selection-title">Vyberte režim plánování</h2>
                    <div className="route-mode-cards-container">
                        <button
                            onClick={() => onInitialize('simple', routeName)}
                            className="route-mode-btn route-mode-btn-simple"
                        >
                            <div className="route-mode-header">
                                <h3 className="route-mode-title">Jednoduchý</h3>
                                <Badge variant="primary" className="route-mode-badge-simple">Pro začátečníky</Badge>
                            </div>
                            <p className="route-mode-desc">
                                Zadáte pouze start, cíl a volitelně průjezdní body. Nastavení trasy je automatické.
                            </p>
                            <div className="route-mode-footer">
                                <ArrowRight className="route-mode-arrow route-mode-arrow-simple" size={20} />
                            </div>
                        </button>

                        <button
                            onClick={() => onInitialize('manual', routeName)}
                            className="route-mode-btn route-mode-btn-manual"
                        >
                            <div className="route-mode-header">
                                <h3 className="route-mode-title">Pokročilý</h3>
                                <Badge variant="neutral" className="route-mode-badge-manual">Pro pokročilé</Badge>
                            </div>
                            <p className="route-mode-desc">
                                Celou trasu si bod po bodu nakreslíte na mapě. Nastavení trasy je na vás.
                            </p>
                            <div className="route-mode-footer">
                                <ArrowRight className="route-mode-arrow route-mode-arrow-manual" size={20} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteInitStep;
