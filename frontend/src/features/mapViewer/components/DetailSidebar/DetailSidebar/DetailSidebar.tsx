import React from 'react';
import { X, Star, Globe, Info, ExternalLink } from 'lucide-react';
import { useDetailSidebar } from '../../../hooks/useDetailSidebar';
import PoiInfoSection from '../components/PoiInfoSection/PoiInfoSection';
import CampInfoSection from '../components/CampInfoSection/CampInfoSection';
import "./DetailSidebar.css";

interface DetailSidebarProps {
    type: 'poi' | 'camp' | null;
    id: number | null;
    onClose: () => void;
}

const DetailSidebar: React.FC<DetailSidebarProps> = ({ type, id, onClose }) => {
    const { data, isLoading } = useDetailSidebar(type, id);

    if (!type && !id && !data) return null;

    const isOpen = !!(type && id);

    {/* --- START: AI-GENERATED UI (Claude 3.7 Sonnet Thinking) --- */}
    {/* Layout and structure generated from design. Data binding and variables added manually. */}

    return (
        <div className={`detail-sidebar-container ${isOpen ? 'detail-sidebar-container-open' : 'detail-sidebar-container-closed'}`}>
            <div className="detail-sidebar-header">
                <h3 className="detail-sidebar-title">
                    {isLoading ? "Načítám..." : data?.name}
                </h3>
                <button onClick={onClose} className="detail-sidebar-close-btn">
                    <X size={20} />
                </button>
            </div>

            <div className="detail-sidebar-content-area">
                {isLoading ? (
                    <div className="detail-sidebar-loading-wrapper">
                        <div className="detail-sidebar-loading-spinner"></div>
                    </div>
                ) : data ? (
                    <div>
                        {data.image_url && (
                            <div className="detail-sidebar-hero">
                                <img
                                    src={data.image_url}
                                    alt={data.name}
                                    className="detail-sidebar-hero-img"
                                />
                                <div className="detail-sidebar-hero-gradient"></div>
                                <div className="detail-sidebar-hero-badges">
                                    {type === 'poi' && data.category && (
                                        <span className="detail-sidebar-category-badge">{data.category.name}</span>
                                    )}
                                    {(data.review_count ?? 0) > 0 && (
                                        <div className="detail-sidebar-review-badge">
                                            <Star size={14} style={{ color: 'var(--color-warning-500)', fill: 'var(--color-warning-500)' }} />
                                            <span className="detail-sidebar-review-score">{data.review}</span>
                                            <span className="detail-sidebar-review-count">({data.review_count})</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="detail-sidebar-body">
                            <div className="detail-sidebar-actions-row">
                                {(data.website || data.web) && (
                                    <a
                                        href={data.website || data.web}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="detail-sidebar-action-btn detail-sidebar-action-web"
                                    >
                                        <Globe size={16} /> Web
                                    </a>
                                )}
                                {(data.kudyznudy_url || data.url) && (
                                    <a
                                        href={data.kudyznudy_url || data.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="detail-sidebar-action-btn detail-sidebar-action-ext"
                                    >
                                        <ExternalLink size={16} />
                                        {data.kudyznudy_url ? "Kudy z nudy" : "Dokempu.cz"}
                                    </a>
                                )}
                                {data.price_list_url && (
                                    <a
                                        href={data.price_list_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="detail-sidebar-action-btn detail-sidebar-action-price"
                                    >
                                        Ceník
                                    </a>
                                )}
                            </div>

                            {type === 'poi' && <PoiInfoSection data={data} />}
                            {type === 'camp' && <CampInfoSection data={data} />}

                            {data.equipment && data.equipment.length > 0 && (
                                <div>
                                    <h4 className="detail-sidebar-section-title">Vybavení</h4>
                                    <div className="detail-sidebar-chips-row">
                                        {data.equipment.map(eq => (
                                            <span key={eq.id} className="detail-sidebar-chip-eq">{eq.name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(data.labels || data.tags) && (
                                <div className="detail-sidebar-tags-section">
                                    <div className="detail-sidebar-chips-row">
                                        {[...(data.labels || []), ...(data.tags || [])].map(tag => (
                                            <span key={tag.id} className="detail-sidebar-tag-item">#{tag.name}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="detail-sidebar-empty-state">
                        <Info size={48} className="detail-sidebar-empty-icon" />
                        <p>Vyberte bod na mapě pro zobrazení detailů.</p>
                    </div>
                )}
            </div>
        </div>
    );

    {/* --- END: AI-GENERATED UI --- */}
};

export default DetailSidebar;
