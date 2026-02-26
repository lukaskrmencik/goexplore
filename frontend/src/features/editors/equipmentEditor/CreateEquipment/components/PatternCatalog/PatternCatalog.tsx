import React from 'react';
import { Dumbbell } from 'lucide-react';
import './PatternCatalog.css';
import type { GeneralEquipment } from '../../../../../../types/equipment';
import { getImageUrl } from '../../../../../../utils/imageUrl';
import { buildPageRange } from '../../../../../../utils/pagination';

interface PatternCatalogProps {
    generalEquipment: GeneralEquipment[];
    isLoadingPatterns: boolean;
    searchTerm: string;
    patternPage: number;
    patternTotalPages: number;
    onSearchChange: (term: string) => void;
    onPatternSelect: (pattern: GeneralEquipment) => void;
    onPageChange: (page: number) => void;
}

const PatternCatalog: React.FC<PatternCatalogProps> = ({
    generalEquipment,
    isLoadingPatterns,
    searchTerm,
    patternPage,
    patternTotalPages,
    onSearchChange,
    onPatternSelect,
    onPageChange,
}) => (
    <div className="create-equipment-select-view">
        <div className="create-equipment-search-wrapper">
            <input
                type="text"
                placeholder="Hledat šablony (např. Stan, Vařič)..."
                className="create-equipment-search-input"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
            />
        </div>

        {isLoadingPatterns ? (
            <div className="create-equipment-patterns-loading">
                <div className="create-equipment-spinner"></div>
                <span>Načítám katalog...</span>
            </div>
        ) : (
            <>
                <div className="create-equipment-pattern-grid">
                    {generalEquipment.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onPatternSelect(item)}
                            className="create-equipment-pattern-card"
                        >
                            <div className="create-equipment-pattern-card-icon">
                                {item.img ? (
                                    <img src={getImageUrl(item.img) ?? undefined} alt={item.name} />
                                ) : (
                                    <Dumbbell size={28} strokeWidth={2.5} />
                                )}
                            </div>
                            <div className="create-equipment-pattern-card-info">
                                <h3 className="create-equipment-pattern-card-name">{item.name}</h3>
                                {item.general_specifications && Object.keys(item.general_specifications).length > 0 ? (
                                    <div className="create-equipment-pattern-card-specs">
                                        {Object.entries(item.general_specifications).slice(0, 3).map(([key, value]) => (
                                            <span key={key} className="create-equipment-pattern-card-spec-badge">
                                                {key.replace(/_/g, ' ')}: {String(value)}
                                            </span>
                                        ))}
                                        {Object.keys(item.general_specifications).length > 3 && (
                                            <span className="create-equipment-pattern-card-spec-badge">
                                                +{Object.keys(item.general_specifications).length - 3} další
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <span className="create-equipment-pattern-card-meta">Vlastní specifikace</span>
                                )}
                            </div>
                        </button>
                    ))}
                    {generalEquipment.length === 0 && (
                        <div className="create-equipment-no-results">
                            Žádné šablony odpovídající hledání.
                        </div>
                    )}
                </div>

                {patternTotalPages > 1 && generalEquipment.length > 0 && (
                    <div className="equipment-editor-pagination">
                        <button
                            onClick={() => onPageChange(Math.max(1, patternPage - 1))}
                            disabled={patternPage === 1}
                            className="equipment-editor-page-btn"
                        >
                            Předchozí
                        </button>
                        <div className="equipment-editor-page-numbers">
                            {buildPageRange(patternPage, patternTotalPages).map(num => (
                                <button
                                    key={num}
                                    onClick={() => onPageChange(num)}
                                    className={`equipment-editor-num-btn ${patternPage === num ? 'equipment-editor-num-btn-active' : 'equipment-editor-num-btn-inactive'}`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => onPageChange(Math.min(patternTotalPages, patternPage + 1))}
                            disabled={patternPage === patternTotalPages}
                            className="equipment-editor-page-btn"
                        >
                            Další
                        </button>
                    </div>
                )}
            </>
        )}
    </div>
);

export default PatternCatalog;
